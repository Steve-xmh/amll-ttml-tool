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
import {
	audioBufferAtom,
	auditionTimeAtom,
	currentTimeAtom,
	spectrogramGainAtom,
} from "$/states/audio.ts";
import { isDraggingAtom } from "$/states/dnd.ts";
import { audioEngine } from "$/utils/audio.ts";
import { msToTimestamp } from "$/utils/timestamp.ts";
import styles from "./audio-spectrogram.module.css";
import { LyricTimelineOverlay } from "./LyricTimelineOverlay";
import { TimelineRuler, type TimelineRulerHandle } from "./TimelineRuler.tsx";

const TILE_DURATION_S = 5;
const SPECTROGRAM_HEIGHT = 256;
const LOD_WIDTHS = [512, 1024, 2048, 4096];

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
	const auditionTime = useAtomValue(auditionTimeAtom);

	const [zoom, setZoom] = useState(200);
	const gain = useAtomValue(spectrogramGainAtom);
	const [visibleTiles, setVisibleTiles] = useState<TileComponentProps[]>([]);
	const [renderTrigger, setRenderTrigger] = useState(0);

	const workerRef = useRef<Worker | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const [targetScrollLeft, setTargetScrollLeft] = useState<number | null>(null);
	const [containerWidth, setContainerWidth] = useState(0);
	const [scrollLeft, setScrollLeft] = useState(0);
	const [isHovering, setIsHovering] = useState(false);
	const [hoverPositionPx, setHoverPositionPx] = useState(0);
	const isDragging = useAtomValue(isDraggingAtom);

	const rulerRef = useRef<TimelineRulerHandle>(null);
	const tileCache = useRef<
		Map<string, { bitmap: ImageBitmap; width: number; gain: number }>
	>(new Map());
	const requestedTiles = useRef<Set<string>>(new Set());

	useEffect(() => {
		const worker = new Worker(
			new URL("../../workers/spectrogram.worker.ts", import.meta.url),
			{ type: "module" },
		);
		workerRef.current = worker;

		worker.onmessage = (event: MessageEvent) => {
			const {
				type,
				tileId,
				imageBitmap,
				renderedWidth,
				gain: renderedGain,
			} = event.data;

			if (type === "TILE_READY") {
				if (tileId && imageBitmap && renderedWidth && renderedGain != null) {
					const tileIndex = tileId.split("-")[1];
					if (tileIndex == null) {
						imageBitmap.close();
						requestedTiles.current.delete(tileId);
						return;
					}
					const cacheId = `tile-${tileIndex}`;

					const existingEntry = tileCache.current.get(cacheId);

					if (
						!existingEntry ||
						renderedWidth >= existingEntry.width ||
						renderedGain !== existingEntry.gain
					) {
						if (existingEntry?.bitmap) {
							existingEntry.bitmap.close();
						}
						tileCache.current.set(cacheId, {
							bitmap: imageBitmap,
							width: renderedWidth,
							gain: renderedGain,
						});
					} else {
						imageBitmap.close();
					}
					requestedTiles.current.delete(tileId);
				}
				setRenderTrigger((c) => c + 1);
			} else if (type === "INIT_COMPLETE") {
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

		for (let i = firstVisibleIndex - 2; i <= lastVisibleIndex + 2; i++) {
			if (i < 0 || i >= totalTiles) continue;

			const cacheId = `tile-${i}`;
			const targetLodWidth =
				LOD_WIDTHS.find((w) => w >= tileDisplayWidthPx) ||
				LOD_WIDTHS[LOD_WIDTHS.length - 1];

			const cacheEntry = tileCache.current.get(cacheId);
			const currentBitmap = cacheEntry?.bitmap;
			const currentWidth = cacheEntry?.width || 0;
			const currentGain = cacheEntry?.gain;

			const needsRequest =
				(targetLodWidth > currentWidth || currentGain !== gain) &&
				targetLodWidth > 0;

			const reqId = `req-${i}-w${targetLodWidth}-g${gain}`;

			if (needsRequest && !requestedTiles.current.has(reqId)) {
				requestedTiles.current.add(reqId);
				workerRef.current?.postMessage({
					type: "GET_TILE",
					tileId: reqId,
					startTime: i * TILE_DURATION_S,
					endTime: i * TILE_DURATION_S + TILE_DURATION_S,
					gain: gain,
					tileWidthPx: targetLodWidth,
				});
			}

			newVisibleTiles.push({
				tileId: cacheId,
				left: i * tileDisplayWidthPx,
				width: tileDisplayWidthPx,
				canvasWidth: currentBitmap?.width || targetLodWidth,
				bitmap: currentBitmap,
			});
		}
		setVisibleTiles(newVisibleTiles);
	}, [audioBuffer, zoom, gain]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: renderTrigger 用来重运行这个 effect
	useEffect(() => {
		updateVisibleTiles();
	}, [updateVisibleTiles, renderTrigger]);

	const handleRulerSeek = (timeInSeconds: number) => {
		audioEngine.seekMusic(timeInSeconds);
		setCurrentTime(Math.round(timeInSeconds * 1000));
	};

	const handleWheelScroll = useCallback((event: WheelEvent) => {
		if (!scrollContainerRef.current) {
			return;
		}

		const container = scrollContainerRef.current;

		if (event.ctrlKey) {
			event.preventDefault();

			setZoom((currentZoom) => {
				const rect = container.getBoundingClientRect();
				const mouseX = event.clientX - rect.left;
				const timeAtCursor = (container.scrollLeft + mouseX) / currentZoom;

				const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
				const newZoom = Math.max(50, Math.min(currentZoom * zoomFactor, 10000));

				if (newZoom === currentZoom) return currentZoom;

				const newScrollLeft = timeAtCursor * newZoom - mouseX;

				setTargetScrollLeft(newScrollLeft);
				setScrollLeft(newScrollLeft);
				setHoverPositionPx(timeAtCursor * newZoom);

				return newZoom;
			});
		} else {
			const scrollAmount = event.deltaY + event.deltaX;
			if (scrollAmount !== 0) {
				event.preventDefault();
				container.scrollLeft += scrollAmount;
				setScrollLeft(container.scrollLeft);
			}
		}
	}, []);

	useLayoutEffect(() => {
		if (targetScrollLeft !== null && scrollContainerRef.current) {
			scrollContainerRef.current.scrollLeft = targetScrollLeft;
			setTargetScrollLeft(null);
		}
	}, [targetScrollLeft]);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		container.addEventListener("wheel", handleWheelScroll, { passive: false });

		return () => {
			container.removeEventListener("wheel", handleWheelScroll);
		};
	}, [handleWheelScroll]);

	useEffect(() => {
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
		const newScrollLeft = scrollContainerRef.current.scrollLeft;
		setScrollLeft(newScrollLeft);
		rulerRef.current?.draw(newScrollLeft);
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

	const handleScrubMove = useCallback(
		(event: MouseEvent) => {
			if (!scrollContainerRef.current || !audioBuffer) return;

			const rect = scrollContainerRef.current.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;

			const clampedMouseX = Math.max(0, Math.min(mouseX, rect.width));

			const timeAtCursor =
				(scrollContainerRef.current.scrollLeft + clampedMouseX) / zoom;

			const clampedTime = Math.max(
				0,
				Math.min(timeAtCursor, audioBuffer.duration),
			);

			audioEngine.seekMusic(clampedTime);
			setCurrentTime(clampedTime * 1000);
		},
		[audioBuffer, zoom, setCurrentTime],
	);

	const handleScrubEnd = useCallback(() => {
		window.removeEventListener("mousemove", handleScrubMove);
		window.removeEventListener("mouseup", handleScrubEnd);
	}, [handleScrubMove]);

	const handleScrubStart = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();

			handleScrubMove(event.nativeEvent);

			window.addEventListener("mousemove", handleScrubMove);
			window.addEventListener("mouseup", handleScrubEnd, { once: true });
		},
		[handleScrubMove, handleScrubEnd],
	);

	const totalWidth = audioBuffer ? audioBuffer.duration * zoom : 0;
	const cursorPosition = currentTime * zoom;
	const auditionCursorPosition = auditionTime ? auditionTime * zoom : null;
	const handleLeftPosition = cursorPosition - scrollLeft;

	const clampedHoverPositionPx = Math.max(
		0,
		Math.min(hoverPositionPx, totalWidth),
	);
	const hoverTimeS =
		audioBuffer && zoom > 0 ? clampedHoverPositionPx / zoom : 0;
	const hoverTimeFormatted = msToTimestamp(hoverTimeS * 1000);

	return (
		<div className={styles.spectrogramContainer}>
			<TimelineRuler
				ref={rulerRef}
				zoom={zoom}
				duration={audioBuffer?.duration || 0}
				containerWidth={containerWidth}
				onSeek={handleRulerSeek}
			/>
			{audioBuffer && (
				// biome-ignore lint/a11y/noStaticElementInteractions: 全局快捷键已经可以处理播放控制了，不应该再在这里额外添加处理
				<div
					className={styles.playheadScrubHandle}
					style={{
						left: `${handleLeftPosition}px`,
						display:
							handleLeftPosition < 0 || handleLeftPosition > containerWidth
								? "none"
								: "block",
					}}
					onMouseDown={handleScrubStart}
				/>
			)}
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
				{/** biome-ignore lint/a11y/useSemanticElements: <fieldset> 在这里不适用 */}
				<div
					style={{
						width: `${totalWidth}px`,
						height: "100%",
						position: "relative",
					}}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onMouseMove={handleMouseMove}
					role="group"
				>
					{visibleTiles.map((tile) => (
						<TileComponent key={tile.tileId} {...tile} />
					))}
					<div
						className={styles.playheadCursor}
						style={{
							left: `${cursorPosition}px`,
						}}
					/>
					{auditionCursorPosition !== null && (
						<div
							style={{
								position: "absolute",
								left: `${auditionCursorPosition}px`,
								top: 0,
								width: "2px",
								height: "100%",
								backgroundColor: "var(--blue-a9)",
								zIndex: 9,
								pointerEvents: "none",
							}}
						/>
					)}
					<Theme appearance="dark">
						<LyricTimelineOverlay
							zoom={zoom}
							scrollLeft={scrollLeft}
							clientWidth={containerWidth}
						/>
						{isHovering && audioBuffer && !isDragging && (
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
