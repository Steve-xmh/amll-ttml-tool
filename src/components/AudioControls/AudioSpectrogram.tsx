import { Theme } from "@radix-ui/themes";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	type FC,
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useSpectrogramWorker } from "$/hooks/useSpectrogramWorker.ts";
import {
	audioBufferAtom,
	auditionTimeAtom,
	currentTimeAtom,
	spectrogramContainerWidthAtom,
	spectrogramGainAtom,
	spectrogramScrollLeftAtom,
	spectrogramZoomAtom,
} from "$/states/audio.ts";
import { isDraggingAtom } from "$/states/dnd.ts";
import { audioEngine } from "$/utils/audio.ts";
import { msToTimestamp } from "$/utils/timestamp.ts";
import styles from "./AudioSpectrogram.module.css";
import { LyricTimelineOverlay } from "./LyricTimelineOverlay.tsx";
import {
	type ISpectrogramContext,
	SpectrogramContext,
} from "./SpectrogramContext.ts";
import { TimelineRuler, type TimelineRulerHandle } from "./TimelineRuler.tsx";

const TILE_DURATION_S = 5;
const SPECTROGRAM_HEIGHT = 256;
const LOD_WIDTHS = [512, 1024, 2048, 4096, 8192];

const clampZoom = (z: number) => Math.max(50, Math.min(z, 10000));

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
		const currentBitmapRef = useRef<ImageBitmap | undefined>(undefined);

		useEffect(() => {
			if (bitmap !== currentBitmapRef.current) {
				if (currentBitmapRef.current) {
					currentBitmapRef.current.close();
				}
				currentBitmapRef.current = bitmap;
			}

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

	const [zoom, setZoom] = useAtom(spectrogramZoomAtom);
	const gain = useAtomValue(spectrogramGainAtom);
	const [visibleTiles, setVisibleTiles] = useState<TileComponentProps[]>([]);

	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const [containerWidth, setContainerWidth] = useAtom(
		spectrogramContainerWidthAtom,
	);
	const [scrollLeft, setScrollLeft] = useAtom(spectrogramScrollLeftAtom);
	const [isHovering, setIsHovering] = useState(false);
	const [hoverPositionPx, setHoverPositionPx] = useState(0);
	const isDragging = useAtomValue(isDraggingAtom);

	const rulerRef = useRef<TimelineRulerHandle>(null);

	const targetScrollLeftRef = useRef(scrollLeft);
	const targetZoomRef = useRef(zoom);
	const animationFrameRef = useRef<number | null>(null);
	const currentScrollLeftRef = useRef(scrollLeft);
	const currentZoomRef = useRef(zoom);

	const { tileCache, requestTileIfNeeded } = useSpectrogramWorker(audioBuffer);

	const contextValue = useMemo<ISpectrogramContext>(
		() => ({
			scrollContainerRef,
			zoom,
			scrollLeft,
		}),
		[zoom, scrollLeft],
	);

	const updateVisibleTiles = useCallback(() => {
		if (!audioBuffer || !scrollContainerRef.current) return;

		const pixelsPerSecond = currentZoomRef.current;
		const tileDisplayWidthPx = TILE_DURATION_S * pixelsPerSecond;
		const totalTiles = Math.ceil(audioBuffer.duration / TILE_DURATION_S);

		const viewStart = currentScrollLeftRef.current;
		const viewEnd = viewStart + containerWidth;

		const firstVisibleIndex = Math.floor(viewStart / tileDisplayWidthPx);
		const lastVisibleIndex = Math.ceil(viewEnd / tileDisplayWidthPx);

		const newVisibleTiles: TileComponentProps[] = [];

		for (let i = firstVisibleIndex - 2; i <= lastVisibleIndex + 2; i++) {
			if (i < 0 || i >= totalTiles) continue;

			const cacheId = `tile-${i}`;
			const targetLodWidth =
				LOD_WIDTHS.find((w) => w >= tileDisplayWidthPx) ||
				LOD_WIDTHS[LOD_WIDTHS.length - 1];

			const reqId = `req-${i}-w${targetLodWidth}-g${gain}`;

			requestTileIfNeeded({
				cacheId,
				reqId,
				startTime: i * TILE_DURATION_S,
				endTime: i * TILE_DURATION_S + TILE_DURATION_S,
				gain: gain,
				tileWidthPx: targetLodWidth,
			});

			const cacheEntry = tileCache.current.get(cacheId);
			const currentBitmap = cacheEntry?.bitmap;

			newVisibleTiles.push({
				tileId: cacheId,
				left: i * tileDisplayWidthPx,
				width: tileDisplayWidthPx,
				canvasWidth: currentBitmap?.width || targetLodWidth,
				bitmap: currentBitmap,
			});
		}
		setVisibleTiles(newVisibleTiles);
	}, [audioBuffer, containerWidth, gain, requestTileIfNeeded, tileCache]);

	const updateVisibleTilesRef = useRef(updateVisibleTiles);
	useLayoutEffect(() => {
		updateVisibleTilesRef.current = updateVisibleTiles;
	}, [updateVisibleTiles]);

	useEffect(() => {
		updateVisibleTiles();
	}, [updateVisibleTiles]);

	const handleRulerSeek = (timeInSeconds: number) => {
		audioEngine.seekMusic(timeInSeconds);
		setCurrentTime(Math.round(timeInSeconds * 1000));
	};

	const animationLoop = useCallback(() => {
		const targetScroll = targetScrollLeftRef.current;
		const targetZoom = targetZoomRef.current;
		const currentScroll = currentScrollLeftRef.current;
		const currentZoom = currentZoomRef.current;

		const lerpFactor = 0.35;
		const nextScroll =
			(1 - lerpFactor) * currentScroll + lerpFactor * targetScroll;
		const nextZoom = (1 - lerpFactor) * currentZoom + lerpFactor * targetZoom;

		const scrollDiff = Math.abs(nextScroll - targetScroll);
		const zoomDiff = Math.abs(nextZoom - targetZoom);

		if (scrollDiff < 1 && zoomDiff < 2) {
			setScrollLeft(targetScroll);
			setZoom(targetZoom);
			animationFrameRef.current = null;
		} else {
			setScrollLeft(nextScroll);
			setZoom(nextZoom);
			animationFrameRef.current = requestAnimationFrame(animationLoop);
		}
	}, [setScrollLeft, setZoom]);

	const startAnimation = useCallback(() => {
		if (animationFrameRef.current === null) {
			animationFrameRef.current = requestAnimationFrame(animationLoop);
		}
	}, [animationLoop]);

	const handleWheelScroll = useCallback(
		(event: WheelEvent) => {
			if (!scrollContainerRef.current || !audioBuffer) {
				return;
			}
			event.preventDefault();

			const container = scrollContainerRef.current;
			const rect = container.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;

			if (event.ctrlKey) {
				const currentZoom = targetZoomRef.current;
				const currentScroll = targetScrollLeftRef.current;

				const timeAtCursor = (currentScroll + mouseX) / currentZoom;
				const zoomFactor = event.deltaY < 0 ? 1.15 : 0.85;
				const newZoom = clampZoom(currentZoom * zoomFactor);
				if (newZoom === currentZoom) return;

				const newScrollLeft = timeAtCursor * newZoom - mouseX;

				const totalWidth = audioBuffer.duration * newZoom;
				const maxScrollLeft = Math.max(0, totalWidth - containerWidth);
				const clampedScrollLeft = Math.max(
					0,
					Math.min(newScrollLeft, maxScrollLeft),
				);

				targetZoomRef.current = newZoom;
				targetScrollLeftRef.current = clampedScrollLeft;
			} else {
				const scrollAmount = event.deltaY + event.deltaX;
				if (scrollAmount !== 0) {
					const newScrollLeft = targetScrollLeftRef.current + scrollAmount;

					const totalWidth = audioBuffer.duration * targetZoomRef.current;
					const maxScrollLeft = Math.max(0, totalWidth - containerWidth);
					const clampedScrollLeft = Math.max(
						0,
						Math.min(newScrollLeft, maxScrollLeft),
					);

					targetScrollLeftRef.current = clampedScrollLeft;
				}
			}

			startAnimation();
		},
		[startAnimation, audioBuffer, containerWidth],
	);

	useLayoutEffect(() => {
		currentScrollLeftRef.current = scrollLeft;
		if (animationFrameRef.current === null) {
			targetScrollLeftRef.current = scrollLeft;
		}
		rulerRef.current?.draw(scrollLeft);
		updateVisibleTiles();
	}, [scrollLeft, updateVisibleTiles]);

	useLayoutEffect(() => {
		currentZoomRef.current = zoom;

		if (animationFrameRef.current === null) {
			targetZoomRef.current = zoom;
		}
		updateVisibleTiles();
	}, [zoom, updateVisibleTiles]);

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
	}, [setContainerWidth]);

	const handleMouseEnter = () => setIsHovering(true);
	const handleMouseLeave = () => setIsHovering(false);
	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		setHoverPositionPx(x);

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

			const timeAtCursor = (scrollLeft + clampedMouseX) / zoom;

			const clampedTime = Math.max(
				0,
				Math.min(timeAtCursor, audioBuffer.duration),
			);

			audioEngine.seekMusic(clampedTime);
			setCurrentTime(clampedTime * 1000);
		},
		[audioBuffer, zoom, setCurrentTime, scrollLeft],
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

	const clampedMouseX = Math.max(0, Math.min(hoverPositionPx, containerWidth));
	const hoverX = scrollLeft + clampedMouseX;
	const hoverTimeS = audioBuffer && zoom > 0 ? hoverX / zoom : 0;
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
			{/** biome-ignore lint/a11y/useSemanticElements: <fieldset> 在这里不适用 */}
			<div
				ref={scrollContainerRef}
				className={styles.virtualScrollContainer}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onMouseMove={handleMouseMove}
				style={{
					flexGrow: 1,
					overflowX: "hidden",
					overflowY: "hidden",
					position: "relative",
				}}
				role="group"
			>
				<div
					style={{
						width: `${totalWidth}px`,
						height: "100%",
						position: "relative",
						transform: `translateX(${-scrollLeft}px)`,
						willChange: "transform",
					}}
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
					<SpectrogramContext.Provider value={contextValue}>
						<Theme appearance="dark">
							<LyricTimelineOverlay clientWidth={containerWidth} />
							{isHovering && audioBuffer && !isDragging && (
								<div
									style={{
										position: "absolute",
										left: `${hoverX}px`,
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
					</SpectrogramContext.Provider>
				</div>
			</div>
		</div>
	);
};

export default AudioSpectrogram;
