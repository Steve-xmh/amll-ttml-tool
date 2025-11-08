import { useAtomValue, useSetAtom } from "jotai";
import React, { type FC, useCallback, useContext } from "react";
import {
	previewLineAtom,
	selectedWordIdAtom,
	timelineDragAtom,
} from "$/states/dnd.ts";
import {
	SyllableDisplayMode,
	selectedLinesAtom,
	syllableDisplayModeAtom,
} from "$/states/main.ts";
import { audioEngine } from "$/utils/audio.ts";
import type { ProcessedLyricLine } from "$/utils/segment-processing.ts";
import {
	commitUpdatedLine,
	getUpdatedLineForLinePan,
} from "$/utils/timeline-mutations";
import { DividerSegment } from "./DividerSegment.tsx";
import { GapSegment } from "./GapSegment.tsx";
import styles from "./LyricLineSegment.module.css";
import { LyricWordSegment } from "./LyricWordSegment.tsx";
import { SpectrogramContext } from "./SpectrogramContext.ts";

const NUDGE_MS = 10;
const SHIFT_NUDGE_MS = 50;

interface LyricLineSegmentProps {
	line: ProcessedLyricLine;
	allLines: ProcessedLyricLine[];
}

export const LyricLineSegment: FC<LyricLineSegmentProps> = ({
	line,
	allLines,
}) => {
	const previewLine = useAtomValue(previewLineAtom);
	const selectedLines = useAtomValue(selectedLinesAtom);
	const setSelectedLines = useSetAtom(selectedLinesAtom);
	const setSelectedWordId = useSetAtom(selectedWordIdAtom);
	const setTimelineDrag = useSetAtom(timelineDragAtom);
	const { zoom, scrollLeft, scrollContainerRef } =
		useContext(SpectrogramContext);
	const displayMode = useAtomValue(syllableDisplayModeAtom);

	let displayLine: ProcessedLyricLine;
	if (previewLine && previewLine.id === line.id) {
		displayLine = previewLine;
	} else {
		displayLine = line;
	}

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (!displayLine) return;
			e.stopPropagation();

			const { id, startTime } = displayLine;

			if (displayMode === SyllableDisplayMode.SyllableMode) {
				setSelectedLines(new Set([id]));
				setSelectedWordId(null);
			} else if (displayMode === SyllableDisplayMode.LineMode) {
				if (e.button !== 0) return;
				e.preventDefault();

				const scrollContainer = scrollContainerRef.current;
				if (!scrollContainer) return;
				const rect = scrollContainer.getBoundingClientRect();

				const initialMouseTimeMS =
					((scrollLeft + (e.clientX - rect.left)) / zoom) * 1000;

				setTimelineDrag({
					type: "line-pan",
					lineId: id,
					initialMouseTimeMS,
					initialLineStartMS: startTime,
				});

				setSelectedLines(new Set([id]));
				setSelectedWordId(null);
			}
		},
		[
			displayLine,
			displayMode,
			scrollContainerRef,
			scrollLeft,
			zoom,
			setSelectedLines,
			setSelectedWordId,
			setTimelineDrag,
		],
	);

	const handleContextMenu = useCallback(
		(e: React.MouseEvent) => {
			if (!displayLine) return;
			if (displayMode !== SyllableDisplayMode.LineMode) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			const { id, startTime, endTime } = displayLine;
			setSelectedLines(new Set([id]));
			setSelectedWordId(null);

			if (startTime != null && endTime != null) {
				audioEngine.auditionRange(startTime / 1000, endTime / 1000);
			}
		},
		[displayLine, displayMode, setSelectedLines, setSelectedWordId],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (!displayLine) return;
			if (displayMode !== SyllableDisplayMode.LineMode) {
				return;
			}

			const { startTime, endTime } = displayLine;

			if (event.key === "Enter") {
				event.preventDefault();
				event.stopPropagation();
				if (startTime != null && endTime != null) {
					audioEngine.auditionRange(startTime / 1000, endTime / 1000);
				}
				return;
			}

			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const nudgeAmount = event.shiftKey ? SHIFT_NUDGE_MS : NUDGE_MS;
			const newStartMS =
				event.key === "ArrowRight"
					? startTime + nudgeAmount
					: startTime - nudgeAmount;

			const updatedLine = getUpdatedLineForLinePan(displayLine, newStartMS);

			commitUpdatedLine(updatedLine);
		},
		[displayLine, displayMode],
	);

	if (!displayLine) {
		return null;
	}

	const { id, startTime, endTime, segments } = displayLine;
	const segmentsLength = segments.length;

	if (startTime == null || endTime == null || endTime <= startTime) {
		return null;
	}

	const left = (startTime / 1000) * zoom;
	const width = ((endTime - startTime) / 1000) * zoom;

	if (width < 1) {
		return null;
	}

	const isTouchingStart = allLines.some(
		(l) => l.id !== line.id && l.endTime === startTime,
	);
	const isTouchingEnd = allLines.some(
		(l) => l.id !== line.id && l.startTime === endTime,
	);

	const showSyllables = displayMode === SyllableDisplayMode.SyllableMode;
	const isDimmed = selectedLines.size > 0 && !selectedLines.has(id);

	const isLineMode = displayMode === SyllableDisplayMode.LineMode;

	const cursorStyle = isLineMode ? "ew-resize" : "auto";

	const dynamicStyles = {
		left: `${left}px`,
		width: `${width}px`,
		cursor: cursorStyle,
	};

	const classNames = `${styles.lineSegment} ${
		isDimmed && isLineMode ? styles.desaturated : ""
	} ${isLineMode ? styles.lineMode : ""}`;

	return (
		// biome-ignore lint/a11y/useSemanticElements: <button> 不适用
		<div
			className={classNames}
			style={dynamicStyles}
			onMouseDown={handleMouseDown}
			onContextMenu={handleContextMenu}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="button"
			aria-label="Lyric Line"
		>
			{showSyllables && (
				<React.Fragment>
					<DividerSegment
						key="divider-start"
						lineId={displayLine.id}
						segmentIndex={-1}
						timeMs={startTime}
						lineStartTime={startTime}
						segmentsLength={segmentsLength}
						isTouching={isTouchingStart}
					/>

					{segments.map((segment, index) => (
						<React.Fragment key={segment.id}>
							{segment.type === "word" ? (
								<LyricWordSegment
									lineId={displayLine.id}
									segment={segment}
									lineStartTime={startTime}
								/>
							) : (
								<GapSegment segment={segment} lineStartTime={startTime} />
							)}
							<DividerSegment
								key={`divider-${segment.id}`}
								lineId={displayLine.id}
								segmentIndex={index}
								timeMs={segment.endTime}
								lineStartTime={startTime}
								segmentsLength={segmentsLength}
								isTouching={
									index === segmentsLength - 1 ? isTouchingEnd : false
								}
							/>
						</React.Fragment>
					))}
				</React.Fragment>
			)}
		</div>
	);
};
