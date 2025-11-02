import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { FC } from "react";
import { useEffect } from "react";
import {
	dragDetailsAtom,
	isDraggingAtom,
	previewLineAtom,
} from "$/states/dnd.ts";
import { lyricLinesAtom } from "$/states/main";
import { globalStore } from "$/states/store.ts";
import type {
	ProcessedLyricLine,
	WordSegment,
} from "$/utils/segment-processing.ts";
import { processedLyricLinesAtom } from "$/utils/segment-processing.ts";
import { LyricLineSegment } from "./LyricLineSegment";

interface LyricTimelineOverlayProps {
	zoom: number;
	scrollLeft: number;
	clientWidth: number;
}

const MIN_DURATION_MS = 1;
const MIN_DIVIDER_WIDTH_PX = 15;

function getUpdatedLineForDivider(
	originalLine: ProcessedLyricLine,
	/**
	 * 分割线左侧 segment 的索引
	 *
	 * -1 表示行首
	 */
	segmentIndex: number,
	/**
	 * 拖拽后计算出的新时间戳
	 */
	newTime: number,
	isGapCreation: boolean,
	zoom: number,
): ProcessedLyricLine {
	const segments = [...originalLine.segments];
	let newStartTime = originalLine.startTime;
	let newEndTime = originalLine.endTime;

	const minVisualDurationMs = (MIN_DIVIDER_WIDTH_PX / zoom) * 1000;
	const dynamicMinDurationMs = Math.max(MIN_DURATION_MS, minVisualDurationMs);

	const leftSegment = segments[segmentIndex] || null;
	const rightSegment = segments[segmentIndex + 1] || null;

	const minTime =
		leftSegment && leftSegment.type === "word"
			? leftSegment.startTime + dynamicMinDurationMs
			: leftSegment
				? leftSegment.startTime
				: 0;

	const maxTime =
		rightSegment && rightSegment.type === "word"
			? rightSegment.endTime - dynamicMinDurationMs
			: rightSegment
				? rightSegment.endTime
				: Infinity;

	let clampedTime = Math.max(minTime, newTime);
	clampedTime = Math.min(maxTime, clampedTime);
	clampedTime = Math.max(0, clampedTime);

	const newSegments = [...segments];

	if (segmentIndex === -1) {
		if (rightSegment && rightSegment.type === "word") {
			clampedTime = Math.min(
				clampedTime,
				rightSegment.endTime - dynamicMinDurationMs,
			);
		}
		newStartTime = clampedTime;
		if (rightSegment) {
			newSegments[segmentIndex + 1] = {
				...rightSegment,
				startTime: clampedTime,
			};
		}
	} else if (segmentIndex === segments.length - 1) {
		if (leftSegment && leftSegment.type === "word") {
			clampedTime = Math.max(
				clampedTime,
				leftSegment.startTime + dynamicMinDurationMs,
			);
		}
		newEndTime = clampedTime;
		if (leftSegment) {
			newSegments[segmentIndex] = { ...leftSegment, endTime: clampedTime };
		}
	} else {
		const originalTime = leftSegment.endTime;
		if (isGapCreation) {
			if (clampedTime > originalTime) {
				newSegments[segmentIndex + 1] = {
					...rightSegment,
					startTime: clampedTime,
				};
			} else if (clampedTime < originalTime) {
				newSegments[segmentIndex] = { ...leftSegment, endTime: clampedTime };
			}
		} else {
			newSegments[segmentIndex] = { ...leftSegment, endTime: clampedTime };
			newSegments[segmentIndex + 1] = {
				...rightSegment,
				startTime: clampedTime,
			};
		}
	}

	return {
		...originalLine,
		startTime: newStartTime,
		endTime: newEndTime,
		segments: newSegments,
	};
}

function commitPreviewLine(previewLine: ProcessedLyricLine) {
	const updatedValidSegments = previewLine.segments.filter(
		(s): s is WordSegment => s.type === "word",
	);

	const updatedWordsMap = new Map<string, WordSegment>(
		updatedValidSegments.map((s) => [s.id, s]),
	);

	globalStore.set(lyricLinesAtom, (prev) => {
		const newLines = prev.lyricLines.map((line) => {
			if (line.id !== previewLine.id) {
				return line;
			}

			const newWords = line.words.map((originalWord) => {
				const updatedWord = updatedWordsMap.get(originalWord.id);

				if (updatedWord) {
					const { type, ...word } = updatedWord;
					return word;
				} else {
					return originalWord;
				}
			});

			return {
				...line,
				startTime: previewLine.startTime,
				endTime: previewLine.endTime,
				words: newWords,
			};
		});

		return {
			...prev,
			lyricLines: newLines,
		};
	});
}

export const LyricTimelineOverlay: FC<LyricTimelineOverlayProps> = ({
	zoom,
	scrollLeft,
	clientWidth,
}) => {
	const processedLines = useAtomValue(processedLyricLinesAtom);
	const isDragging = useAtomValue(isDraggingAtom);
	const [dragDetails, setDragDetails] = useAtom(dragDetailsAtom);
	const setPreviewLine = useSetAtom(previewLineAtom);

	useEffect(() => {
		if (!isDragging || !dragDetails) {
			return;
		}

		const { startX, lineId, segmentIndex, isGapCreation } = dragDetails;

		const currentZoom = zoom;
		const lineBeingDragged = processedLines.find((l) => l.id === lineId);
		if (!lineBeingDragged) {
			setDragDetails(null);
			return;
		}

		let originalTime: number;
		if (segmentIndex === -1) {
			originalTime = lineBeingDragged.startTime;
		} else {
			const leftSegment = lineBeingDragged.segments[segmentIndex];
			if (!leftSegment) {
				setDragDetails(null);
				return;
			}
			originalTime = leftSegment.endTime;
		}

		const handleGlobalMouseMove = (event: MouseEvent) => {
			event.preventDefault();
			const deltaX = event.clientX - startX;
			const deltaTimeMs = Math.round((deltaX / currentZoom) * 1000);
			const newTime = originalTime + deltaTimeMs;

			const preview = getUpdatedLineForDivider(
				lineBeingDragged,
				segmentIndex,
				newTime,
				isGapCreation,
				currentZoom,
			);

			setPreviewLine(preview);
		};

		const handleGlobalMouseUp = (event: MouseEvent) => {
			event.preventDefault();

			const deltaX = event.clientX - startX;
			const deltaTimeMs = Math.round((deltaX / currentZoom) * 1000);
			const newTime = originalTime + deltaTimeMs;

			const updatedLine = getUpdatedLineForDivider(
				lineBeingDragged,
				segmentIndex,
				newTime,
				isGapCreation,
				currentZoom,
			);

			commitPreviewLine(updatedLine);
			setDragDetails(null);
			setPreviewLine(null);
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		window.addEventListener("mouseup", handleGlobalMouseUp, { once: true });

		return () => {
			window.removeEventListener("mousemove", handleGlobalMouseMove);
			window.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, [
		isDragging,
		dragDetails,
		setDragDetails,
		setPreviewLine,
		zoom,
		processedLines,
	]);

	const bufferPx = 500;
	const viewStartMs = ((scrollLeft - bufferPx) / zoom) * 1000;
	const viewEndMs = ((scrollLeft + clientWidth + bufferPx) / zoom) * 1000;

	const visibleLines = processedLines.filter((line) => {
		if (!line.startTime || !line.endTime) return false;
		return line.endTime > viewStartMs && line.startTime < viewEndMs;
	});

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
			}}
		>
			{visibleLines.map((line) => (
				<LyricLineSegment key={line.id} line={line} zoom={zoom} />
			))}
		</div>
	);
};
