import { Theme } from "@radix-ui/themes";
import { useAtomValue, useSetAtom } from "jotai";
import {
	type FC,
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { audioBufferAtom, currentTimeAtom } from "$/states/audio.ts";
import { audioEngine } from "$/utils/audio.ts";
import { msToTimestamp } from "$/utils/timestamp.ts";
import { LyricTimelineOverlay } from "./LyricTimelineOverlay";
import { TimelineRuler, type TimelineRulerHandle } from "./TimelineRuler.tsx";

const TILE_DURATION_S = 5;
const SPECTROGRAM_HEIGHT = 256;

interface TileComponentProps {
	tileId: string;
	left: number;
	width: number;
	canvasWidth: number;
	bitmap?: ImageBitmap;
}

const TileComponent = memo(
	({ tileId, left, width, canvasWidth, bitmap }: TileComponentProps) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);

		useEffect(() => {
			if (bitmap && canvasRef.current) {
				const canvas = canvasRef.current;
				if (canvas.width !== bitmap.width) canvas.width = bitmap.width;
				if (canvas.height !== bitmap.height) canvas.height = bitmap.height;
				const ctx = canvas.getContext("2d");
				ctx?.drawImage(bitmap, 0, 0);
			}
		}, [bitmap]);

		return (
			<canvas
				ref={canvasRef}
				id={tileId}
				width={canvasWidth > 0 ? canvasWidth : 1}
				height={SPECTROGRAM_HEIGHT}
				style={{
					position: "absolute",
					left: `${left}px`,
					top: 0,
					width: `${width}px`,
					height: `${SPECTROGRAM_HEIGHT}px`,
					backgroundColor: bitmap ? "transparent" : "var(--gray-3)",
					imageRendering: "pixelated",
				}}
			/>
		);
	},
);

export const AudioSpectrogram: FC = () => {
	const audioBuffer = useAtomValue(audioBufferAtom);
	const currentTimeInMs = useAtomValue(currentTimeAtom);
	const setCurrentTime = useSetAtom(currentTimeAtom);
	const currentTime = currentTimeInMs / 1000;

	const [zoom, setZoom] = useState(500);
	const [gain, setGain] = useState(9.0);
	const [visibleTiles, setVisibleTiles] = useState<TileComponentProps[]>([]);
	const [renderTrigger, setRenderTrigger] = useState(0);

	const workerRef = useRef<Worker | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const [targetScrollLeft, setTargetScrollLeft] = useState<number | null>(null);
	const [containerWidth, setContainerWidth] = useState(0);
	const [isHovering, setIsHovering] = useState(false);
	const [hoverPositionPx, setHoverPositionPx] = useState(0);

	const rulerRef = useRef<TimelineRulerHandle>(null);
	const tileCache = useRef<Map<string, { bitmap: ImageBitmap; width: number }>>(
		new Map(),
	);
	const requestedTiles = useRef<Set<string>>(new Set());

	useEffect(() => {
		const worker = new Worker(
			new URL("../../workers/spectrogram.worker.ts", import.meta.url),
			{ type: "module" },
		);
		workerRef.current = worker;

		worker.onmessage = (event: MessageEvent) => {
			const { type, tileId, imageBitmap, renderedWidth } = event.data;
			if (type === "TILE_READY" || type === "INIT_COMPLETE") {
				if (tileId && imageBitmap && renderedWidth) {
					const existingEntry = tileCache.current.get(tileId);

					if (!existingEntry || renderedWidth >= existingEntry.width) {
						tileCache.current.set(tileId, {
							bitmap: imageBitmap,
							width: renderedWidth,
						});
					} else {
						imageBitmap.close();
					}
					requestedTiles.current.delete(tileId);
				}
				setRenderTrigger((c) => c + 1);
			}
		};

		return () => worker.terminate();
	}, []);

	useEffect(() => {
		if (audioBuffer && workerRef.current) {
			tileCache.current.clear();
			requestedTiles.current.clear();
			setVisibleTiles([]);

			const channelData = audioBuffer.getChannelData(0);

			const channelDataCopy = channelData.slice();

			workerRef.current.postMessage(
				{
					type: "INIT",
					audioData: channelDataCopy,
					sampleRate: audioBuffer.sampleRate,
				},
				[channelDataCopy.buffer],
			);
		}
	}, [audioBuffer]);

	const updateVisibleTiles = useCallback(() => {
		if (!audioBuffer || !scrollContainerRef.current) return;

		const container = scrollContainerRef.current;
		const pixelsPerSecond = zoom;
		const tileDisplayWidthPx = TILE_DURATION_S * pixelsPerSecond;
		const totalTiles = Math.ceil(audioBuffer.duration / TILE_DURATION_S);

		const viewStart = container.scrollLeft;
		const viewEnd = viewStart + container.clientWidth;

		const firstVisibleIndex = Math.floor(viewStart / tileDisplayWidthPx);
		const lastVisibleIndex = Math.ceil(viewEnd / tileDisplayWidthPx);

		const newVisibleTiles: TileComponentProps[] = [];

		for (let i = firstVisibleIndex - 1; i <= lastVisibleIndex + 1; i++) {
			if (i < 0 || i >= totalTiles) continue;

			const tileId = `tile-${i}`;
			const tileStartTime = i * TILE_DURATION_S;

			const cacheEntry = tileCache.current.get(tileId);
			const targetRenderWidth = Math.min(8192, Math.ceil(tileDisplayWidthPx));

			if (
				(!cacheEntry || cacheEntry.width < targetRenderWidth) &&
				!requestedTiles.current.has(tileId)
			) {
				requestedTiles.current.add(tileId);
				workerRef.current?.postMessage({
					type: "GET_TILE",
					tileId,
					startTime: tileStartTime,
					endTime: tileStartTime + TILE_DURATION_S,
					gain: gain,
					tileWidthPx: targetRenderWidth,
				});
			}

			const bitmap = cacheEntry?.bitmap;
			newVisibleTiles.push({
				tileId,
				left: i * tileDisplayWidthPx,
				width: tileDisplayWidthPx,
				canvasWidth: bitmap?.width || targetRenderWidth,
				bitmap: bitmap,
			});
		}
		setVisibleTiles(newVisibleTiles);
	}, [audioBuffer, zoom, gain]);

	useEffect(() => {
		updateVisibleTiles();
	}, [audioBuffer, zoom, gain, renderTrigger, updateVisibleTiles]);

	const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
		if (!scrollContainerRef.current || !audioBuffer) {
			return;
		}

		const rect = event.currentTarget.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const timeInSeconds = clickX / zoom;

		audioEngine.seekMusic(timeInSeconds);
		setCurrentTime(Math.round(timeInSeconds * 1000));
	};

	const handleWheelScroll = useCallback(
		(event: WheelEvent) => {
			if (!scrollContainerRef.current) {
				return;
			}

			const container = scrollContainerRef.current;

			if (event.ctrlKey) {
				event.preventDefault();

				const rect = container.getBoundingClientRect();
				const mouseX = event.clientX - rect.left;

				const timeAtCursor = (container.scrollLeft + mouseX) / zoom;

				const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
				const newZoom = Math.max(50, Math.min(zoom * zoomFactor, 10000));

				if (newZoom === zoom) {
					return;
				}

				const newScrollLeft = timeAtCursor * newZoom - mouseX;

				setZoom(newZoom);
				setTargetScrollLeft(newScrollLeft);
				setHoverPositionPx(timeAtCursor * newZoom);
			} else {
				const scrollAmount = event.deltaY + event.deltaX;
				if (scrollAmount !== 0) {
					event.preventDefault();
					container.scrollLeft += scrollAmount;
				}
			}
		},
		[zoom, setZoom, setHoverPositionPx],
	);

	useLayoutEffect(() => {
		if (targetScrollLeft !== null && scrollContainerRef.current) {
			scrollContainerRef.current.scrollLeft = targetScrollLeft;
			setTargetScrollLeft(null);
		}
	}, [zoom, targetScrollLeft]);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		container.addEventListener("wheel", handleWheelScroll, { passive: false });

		return () => {
			container.removeEventListener("wheel", handleWheelScroll);
		};
	}, [handleWheelScroll]);

	useLayoutEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const observer = new ResizeObserver((entries) => {
			if (entries[0]) {
				setContainerWidth(entries[0].contentRect.width);
			}
		});

		observer.observe(container);
		setContainerWidth(container.clientWidth);

		return () => observer.disconnect();
	}, []);

	const handleContainerScroll = () => {
		if (!scrollContainerRef.current) return;
		const scrollLeft = scrollContainerRef.current.scrollLeft;
		rulerRef.current?.draw(scrollLeft);
		updateVisibleTiles();
	};

	const handleMouseEnter = () => setIsHovering(true);
	const handleMouseLeave = () => setIsHovering(false);
	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;

		if (x >= 0 && x <= totalWidth) {
			setHoverPositionPx(x);
		}
		if (!isHovering) {
			setIsHovering(true);
		}
	};

	const totalWidth = audioBuffer ? audioBuffer.duration * zoom : 0;
	const cursorPosition = currentTime * zoom;

	const clampedHoverPositionPx = Math.max(
		0,
		Math.min(hoverPositionPx, totalWidth),
	);
	const hoverTimeS =
		audioBuffer && zoom > 0 ? clampedHoverPositionPx / zoom : 0;
	const hoverTimeFormatted = msToTimestamp(hoverTimeS * 1000);

	return (
		<div
			style={{
				height: "16rem",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "var(--gray-2)",
			}}
		>
			<TimelineRuler
				ref={rulerRef}
				zoom={zoom}
				duration={audioBuffer?.duration || 0}
				containerWidth={containerWidth}
			/>
			<div
				ref={scrollContainerRef}
				onScroll={handleContainerScroll}
				style={{
					flexGrow: 1,
					overflowX: "auto",
					overflowY: "hidden",
					position: "relative",
				}}
			>
				<div
					style={{
						width: `${totalWidth}px`,
						height: "100%",
						position: "relative",
					}}
					onClick={handleSeek}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onMouseMove={handleMouseMove}
				>
					{visibleTiles.map((tile) => (
						<TileComponent key={tile.tileId} {...tile} />
					))}
					<div
						style={{
							position: "absolute",
							left: `${cursorPosition}px`,
							top: 0,
							width: "2px",
							height: "100%",
							backgroundColor: "var(--accent-9)",
							zIndex: 10,
							pointerEvents: "none",
						}}
					/>
					<Theme appearance="dark">
						<LyricTimelineOverlay zoom={zoom} />
						{isHovering && audioBuffer && (
							<div
								style={{
									position: "absolute",
									left: `${clampedHoverPositionPx}px`,
									top: 0,
									height: "100%",
									zIndex: 11,
									pointerEvents: "none",
								}}
							>
								<div
									style={{
										width: "1px",
										height: "100%",
										backgroundColor: "var(--gray-a9)",
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: 0,
										left: "5px",
										backgroundColor: "var(--gray-a12)",
										color: "var(--gray-1)",
										padding: "2px 4px",
										borderRadius: "var(--radius-1)",
										fontSize: "10px",
										whiteSpace: "nowrap",
									}}
								>
									{hoverTimeFormatted}
								</div>
							</div>
						)}
					</Theme>
				</div>
			</div>
		</div>
	);
};

export default AudioSpectrogram;
