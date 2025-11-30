import { Theme } from "@radix-ui/themes";
import type { Draft } from "immer";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useSetImmerAtom } from "jotai-immer";
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
import { useTranslation } from "react-i18next";
import { useSpectrogramWorker } from "$/hooks/useSpectrogramWorker.ts";
import { audioBufferAtom, currentTimeAtom } from "$/states/audio.ts";
import { isDraggingAtom } from "$/states/dnd.ts";
import {
	editingTimeFieldAtom,
	lyricLinesAtom,
	requestFocusAtom,
	selectedLinesAtom,
} from "$/states/main.ts";
import {
	auditionTimeAtom,
	currentPaletteAtom,
	spectrogramContainerWidthAtom,
	spectrogramGainAtom,
	spectrogramScrollLeftAtom,
	spectrogramZoomAtom,
} from "$/states/spectrogram.ts";
import { audioEngine } from "$/utils/audio.ts";
import { processSingleLine } from "$/utils/segment-processing.ts";
import { msToTimestamp } from "$/utils/timestamp.ts";
import type { LyricLine, LyricWord } from "$/utils/ttml-types.ts";
import styles from "./AudioSpectrogram.module.css";
import { LyricTimelineOverlay } from "./LyricTimelineOverlay.tsx";
import {
	type ISpectrogramContext,
	SpectrogramContext,
} from "./SpectrogramContext.ts";
import {
	RULER_HEIGHT,
	TimelineRuler,
	type TimelineRulerHandle,
} from "./TimelineRuler.tsx";

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
				className={styles.tileCanvas}
				style={{
					left: `${left}px`,
					width: `${width}px`,
					backgroundColor: bitmap ? "transparent" : "var(--gray-3)",
				}}
			/>
		);
	},
);

function tryInitializeZeroTimestampLine(
	line: Draft<LyricLine>,
	newStartTime: number,
	newEndTime: number,
): boolean {
	const isAllZero =
		line.words.length > 0 &&
		line.words.every((w) => w.startTime === 0 && w.endTime === 0);

	if (isAllZero) {
		line.startTime = newStartTime;
		line.endTime = newEndTime;
		const totalDuration = newEndTime - newStartTime;
		const perWordDuration = totalDuration / line.words.length;

		line.words.forEach((word, index) => {
			word.startTime = newStartTime + index * perWordDuration;
			word.endTime = newStartTime + (index + 1) * perWordDuration;
		});
		return true;
	}
	return false;
}

function shiftLineStartTime(line: Draft<LyricLine>, newStartTime: number) {
	const delta = newStartTime - line.startTime;
	if (delta !== 0) {
		line.startTime = newStartTime;
		for (const word of line.words) {
			word.startTime += delta;
			word.endTime += delta;
		}
	}
}

function adjustLineEndTime(line: Draft<LyricLine>, newEndTime: number) {
	const currentLastWordEnd =
		line.words.length > 0
			? line.words[line.words.length - 1].endTime
			: line.endTime;

	const diff = currentLastWordEnd - newEndTime;

	if (line.words.length === 0) {
		line.endTime = newEndTime;
		return;
	}

	if (diff < 0) {
		line.endTime = newEndTime;
		const lastWord = line.words[line.words.length - 1];
		if (newEndTime > lastWord.startTime) {
			lastWord.endTime = newEndTime;
		}
	} else if (diff > 0) {
		line.endTime = newEndTime;

		const processedLine = processSingleLine(line);

		interface CompressTarget {
			duration: number;
			ref?: Draft<LyricWord>;
		}

		const wordDraftMap = new Map<string, Draft<LyricWord>>();
		for (const w of line.words) {
			wordDraftMap.set(w.id, w);
		}

		const targets: CompressTarget[] = processedLine.segments.map((seg) => ({
			duration: seg.endTime - seg.startTime,
			ref: seg.type === "word" ? wordDraftMap.get(seg.id) : undefined,
		}));

		let remainingReduction = diff;
		const MIN_DURATION = 50;

		for (let i = targets.length - 1; i >= 0; i--) {
			if (remainingReduction <= 0) break;

			const target = targets[i];
			const maxReducible = Math.max(0, target.duration - MIN_DURATION);
			const reduceAmount = Math.min(remainingReduction, maxReducible);

			target.duration -= reduceAmount;
			remainingReduction -= reduceAmount;
		}

		if (remainingReduction > 0) {
			const currentTotalDuration = targets.reduce(
				(sum, t) => sum + t.duration,
				0,
			);
			const targetTotalDuration = currentTotalDuration - remainingReduction;

			if (targetTotalDuration > 0 && currentTotalDuration > 0) {
				const scale = targetTotalDuration / currentTotalDuration;
				for (const target of targets) {
					target.duration *= scale;
				}
			}
		}

		let writeCursor = line.startTime;

		for (const target of targets) {
			if (target.ref) {
				target.ref.startTime = writeCursor;
				target.ref.endTime = writeCursor + target.duration;
			}
			writeCursor += target.duration;
		}
	}
}

export const AudioSpectrogram: FC = () => {
	const audioBuffer = useAtomValue(audioBufferAtom);
	const currentTimeInMs = useAtomValue(currentTimeAtom);
	const setCurrentTime = useSetAtom(currentTimeAtom);
	const currentTime = currentTimeInMs / 1000;
	const auditionTime = useAtomValue(auditionTimeAtom);

	const [zoom, setZoom] = useAtom(spectrogramZoomAtom);
	const gain = useAtomValue(spectrogramGainAtom);
	const palette = useAtomValue(currentPaletteAtom);
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
	const scrollLeftForScrubRef = useRef(scrollLeft);
	const isScrubbingRef = useRef(false);
	const currentMouseXRef = useRef(0);

	const editingTimeField = useAtomValue(editingTimeFieldAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const selectedLines = useAtomValue(selectedLinesAtom);
	const rawLyricLines = useAtomValue(lyricLinesAtom);
	const setRequestFocus = useSetAtom(requestFocusAtom);
	const [pendingStartTime, setPendingStartTime] = useState<number | null>(null);
	const { t } = useTranslation();

	const { tileCache, requestTileIfNeeded, lastTileTimestamp } =
		useSpectrogramWorker(audioBuffer, palette.data);

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

		const currentPaletteId = palette.id;

		for (let i = firstVisibleIndex - 2; i <= lastVisibleIndex + 2; i++) {
			if (i < 0 || i >= totalTiles) continue;

			const cacheId = `tile-${i}`;
			const targetLodWidth =
				LOD_WIDTHS.find((w) => w >= tileDisplayWidthPx) ||
				LOD_WIDTHS[LOD_WIDTHS.length - 1];

			requestTileIfNeeded({
				tileIndex: i,
				startTime: i * TILE_DURATION_S,
				endTime: i * TILE_DURATION_S + TILE_DURATION_S,
				gain: gain,
				tileWidthPx: targetLodWidth,
				paletteId: currentPaletteId,
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
	}, [
		audioBuffer,
		containerWidth,
		gain,
		requestTileIfNeeded,
		tileCache,
		palette.id,
	]);

	const updateVisibleTilesRef = useRef(updateVisibleTiles);
	useLayoutEffect(() => {
		updateVisibleTilesRef.current = updateVisibleTiles;
	}, [updateVisibleTiles]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: lastTileTimestamp 用来重运行这个 effect
	useEffect(() => {
		updateVisibleTiles();
	}, [updateVisibleTiles, lastTileTimestamp]);

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

		if (isScrubbingRef.current && audioBuffer) {
			const rect = scrollContainerRef.current?.getBoundingClientRect();
			if (rect) {
				const clampedMouseX = Math.max(
					0,
					Math.min(currentMouseXRef.current, rect.width),
				);

				const timeAtCursor = (nextScroll + clampedMouseX) / nextZoom;

				const clampedTime = Math.max(
					0,
					Math.min(timeAtCursor, audioBuffer.duration),
				);

				audioEngine.seekMusic(clampedTime);
				setCurrentTime(clampedTime * 1000);
			}
		}

		if (scrollDiff < 1 && zoomDiff < 2) {
			setScrollLeft(targetScroll);
			setZoom(targetZoom);
			animationFrameRef.current = null;
		} else {
			setScrollLeft(nextScroll);
			setZoom(nextZoom);
			animationFrameRef.current = requestAnimationFrame(animationLoop);
		}
	}, [setScrollLeft, setZoom, audioBuffer, setCurrentTime]);

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
		if (lastTileTimestamp === 0) {
			return;
		}
		currentScrollLeftRef.current = scrollLeft;
		scrollLeftForScrubRef.current = scrollLeft;
		if (animationFrameRef.current === null) {
			targetScrollLeftRef.current = scrollLeft;
		}
		rulerRef.current?.draw(scrollLeft);
		updateVisibleTilesRef.current();
	}, [scrollLeft, lastTileTimestamp]);

	useLayoutEffect(() => {
		if (lastTileTimestamp === 0) {
			return;
		}

		currentZoomRef.current = zoom;

		if (animationFrameRef.current === null) {
			targetZoomRef.current = zoom;
		}
		updateVisibleTilesRef.current();
	}, [zoom, lastTileTimestamp]);

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
		currentMouseXRef.current = x;

		if (!isHovering) {
			setIsHovering(true);
		}
	};

	const referenceStartTime = useMemo(() => {
		if (pendingStartTime !== null) return pendingStartTime;

		if (editingTimeField?.field === "endTime") {
			let maxStartTime = -Infinity;
			let hasSelection = false;

			for (const line of rawLyricLines.lyricLines) {
				if (selectedLines.has(line.id)) {
					hasSelection = true;
					if (line.startTime > maxStartTime) {
						maxStartTime = line.startTime;
					}
				}
			}
			return hasSelection ? maxStartTime : 0;
		}
		return 0;
	}, [pendingStartTime, editingTimeField, rawLyricLines, selectedLines]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (pendingStartTime !== null || editingTimeField) {
					setPendingStartTime(null);
					if (document.activeElement instanceof HTMLElement) {
						document.activeElement.blur();
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [pendingStartTime, editingTimeField]);

	const handleContainerMouseDown = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (editingTimeField && !editingTimeField.isWord) {
				event.preventDefault();

				const rect = event.currentTarget.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const clickX = scrollLeft + x;
				const timeMs = (clickX / zoom) * 1000;

				if (editingTimeField.field === "startTime") {
					setPendingStartTime(timeMs);
					setTimeout(() => {
						setRequestFocus("endTime");
					}, 0);
				} else if (editingTimeField.field === "endTime") {
					if (timeMs <= referenceStartTime) {
						return;
					}

					editLyricLines((draft) => {
						for (const line of draft.lyricLines) {
							if (selectedLines.has(line.id)) {
								const newStartTime = pendingStartTime ?? line.startTime;
								const newEndTime = timeMs;

								if (newEndTime <= newStartTime) continue;

								if (
									tryInitializeZeroTimestampLine(line, newStartTime, newEndTime)
								) {
									continue;
								}

								shiftLineStartTime(line, newStartTime);

								adjustLineEndTime(line, newEndTime);
							}
						}
					});

					setPendingStartTime(null);
					setTimeout(() => {
						if (document.activeElement instanceof HTMLElement) {
							document.activeElement.blur();
						}
					}, 0);
				}
			}
		},
		[
			editingTimeField,
			scrollLeft,
			zoom,
			editLyricLines,
			selectedLines,
			setRequestFocus,
			pendingStartTime,
			referenceStartTime,
		],
	);

	const handleScrubMove = useCallback(
		(event: MouseEvent) => {
			if (!scrollContainerRef.current || !audioBuffer) return;

			const rect = scrollContainerRef.current.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			currentMouseXRef.current = mouseX;

			const clampedMouseX = Math.max(0, Math.min(mouseX, rect.width));

			const timeAtCursor =
				(scrollLeftForScrubRef.current + clampedMouseX) / zoom;

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
		isScrubbingRef.current = false;
		window.removeEventListener("mousemove", handleScrubMove);
		window.removeEventListener("mouseup", handleScrubEnd);
	}, [handleScrubMove]);

	const handleScrubStart = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			isScrubbingRef.current = true;

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
	const hoverTimeMs = hoverTimeS * 1000;

	const isInvalidEndTime =
		editingTimeField?.field === "endTime" && hoverTimeMs <= referenceStartTime;

	let hoverTimeFormatted = msToTimestamp(hoverTimeMs);
	let tooltipBgColor: string | undefined;
	let hoverLineColor: string | undefined;

	if (isInvalidEndTime) {
		hoverTimeFormatted = t("spectrogram.invalidEndTime", "不能选择此结束时间");
		tooltipBgColor = "var(--red-9)";
		hoverLineColor = "var(--red-9)";
	} else if (editingTimeField && !editingTimeField.isWord) {
		const fieldName =
			editingTimeField.field === "startTime"
				? t("ribbonBar.editMode.startTime", "起始时间")
				: t("ribbonBar.editMode.endTime", "结束时间");
		hoverTimeFormatted = `${t("common.clickToSet", "点击设置")}${fieldName}: ${hoverTimeFormatted}`;
		tooltipBgColor = "var(--accent-9)";
	}

	const pendingCursorPosition =
		pendingStartTime !== null ? (pendingStartTime / 1000) * zoom : null;

	const showRangePreview =
		editingTimeField?.field === "endTime" &&
		pendingStartTime !== null &&
		!isInvalidEndTime;
	3;

	let previewStyle: React.CSSProperties | undefined;
	if (showRangePreview && pendingStartTime !== null) {
		const startPx = (pendingStartTime / 1000) * zoom;
		const endPx = (hoverTimeMs / 1000) * zoom;
		const width = endPx - startPx;

		if (width > 0) {
			previewStyle = {
				left: `${startPx}px`,
				width: `${width}px`,
			};
		}
	}

	return (
		<div className={styles.spectrogramContainer}>
			<TimelineRuler
				ref={rulerRef}
				zoom={zoom}
				duration={audioBuffer?.duration || 0}
				containerWidth={containerWidth}
				onSeek={handleRulerSeek}
			/>

			{audioBuffer && !isDragging && (
				<>
					<div
						className={styles.hoverTimeTooltip}
						style={{
							left: `${hoverPositionPx}px`,
							opacity: isHovering ? 1 : 0,
							backgroundColor: tooltipBgColor,
						}}
					>
						{hoverTimeFormatted}
					</div>

					<div
						className={`${styles.rulerHoverFade} ${styles.rulerHoverFadeLeft}`}
						style={{
							width: `${hoverPositionPx}px`,
							height: `${RULER_HEIGHT}px`,
							opacity: isHovering ? 1 : 0,
						}}
					/>

					<div
						className={`${styles.rulerHoverFade} ${styles.rulerHoverFadeRight}`}
						style={{
							left: `${hoverPositionPx}px`,
							height: `${RULER_HEIGHT}px`,
							opacity: isHovering ? 1 : 0,
						}}
					/>
				</>
			)}

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
				onMouseDown={handleContainerMouseDown}
				onContextMenu={(e) => e.preventDefault()}
				role="group"
			>
				<div
					className={styles.virtualScrollContent}
					style={{
						width: `${totalWidth}px`,
						transform: `translateX(${-scrollLeft}px)`,
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

					{pendingCursorPosition !== null && (
						<div
							className={styles.pendingCursor}
							style={{
								left: `${pendingCursorPosition}px`,
							}}
						/>
					)}
					{auditionCursorPosition !== null && (
						<div
							className={styles.auditionCursor}
							style={{
								left: `${auditionCursorPosition}px`,
							}}
						/>
					)}
					{showRangePreview && previewStyle && (
						<div className={styles.rangePreviewRegion} style={previewStyle} />
					)}
					<SpectrogramContext.Provider value={contextValue}>
						<Theme appearance="dark">
							<LyricTimelineOverlay
								clientWidth={containerWidth}
								hiddenLineIds={showRangePreview ? selectedLines : null}
							/>
							{audioBuffer && !isDragging && (
								<div
									className={styles.hoverCursorContainer}
									style={{
										left: `${hoverX}px`,
										opacity: isHovering ? 1 : 0,
									}}
								>
									<div
										className={styles.hoverCursorLine}
										style={{ backgroundColor: hoverLineColor }}
									/>
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
