import { useAtomValue, useSetAtom } from "jotai";
import { type FC, useCallback, useContext } from "react";
import { processedLyricLinesAtom } from "$/modules/segmentation/utils/segment-processing.ts";
import { timelineDragAtom } from "$/modules/spectrogram/states/dnd";
import {
	commitUpdatedLine,
	getUpdatedLineForDivider,
} from "$/modules/spectrogram/utils/timeline-mutations";
import styles from "./DividerSegment.module.css";
import { SpectrogramContext } from "./SpectrogramContext";

interface DividerSegmentProps {
	lineId: string;
	segmentIndex: number;
	timeMs: number;
	lineStartTime: number;
	segmentsLength: number;
	isTouching: boolean;
}

const DIVIDER_WIDTH_PX = 15;
const HALF_DIVIDER_WIDTH_PX = DIVIDER_WIDTH_PX / 2;
const NUDGE_MS = 10;
const SHIFT_NUDGE_MS = 50;

export const DividerSegment: FC<DividerSegmentProps> = ({
	lineId,
	segmentIndex,
	timeMs,
	lineStartTime,
	segmentsLength,
	isTouching,
}) => {
	const setTimelineDrag = useSetAtom(timelineDragAtom);
	const processedLines = useAtomValue(processedLyricLinesAtom);
	const { zoom } = useContext(SpectrogramContext);

	const startDrag = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setTimelineDrag({
				type: "divider",
				lineId: lineId,
				segmentIndex: segmentIndex,
				zoom: zoom,
				startX: e.clientX,
				isGapCreation: e.altKey,
			});
		},
		[lineId, segmentIndex, setTimelineDrag, zoom],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const lineBeingDragged = processedLines.find((l) => l.id === lineId);
			if (!lineBeingDragged) {
				return;
			}

			const nudgeAmount = event.shiftKey ? SHIFT_NUDGE_MS : NUDGE_MS;
			const newTime =
				event.key === "ArrowRight"
					? timeMs + nudgeAmount
					: timeMs - nudgeAmount;

			const updatedLine = getUpdatedLineForDivider(
				lineBeingDragged,
				segmentIndex,
				newTime,
				false,
				zoom,
			);

			commitUpdatedLine(updatedLine);
		},
		[lineId, processedLines, segmentIndex, timeMs, zoom],
	);

	if (timeMs == null || timeMs < 0 || lineStartTime == null) return null;

	const timePx = ((timeMs - lineStartTime) / 1000) * zoom;
	const isLineStartHandle = segmentIndex === -1;
	const isLineEndHandle = segmentIndex === segmentsLength - 1;

	const handleWidthPx = DIVIDER_WIDTH_PX;
	let handleOffsetPx: number;

	if (isLineStartHandle && isTouching) {
		handleOffsetPx = 0;
	} else if (isLineEndHandle && isTouching) {
		handleOffsetPx = -DIVIDER_WIDTH_PX;
	} else {
		handleOffsetPx = -HALF_DIVIDER_WIDTH_PX;
	}

	const left = timePx + handleOffsetPx;

	const dynamicStyles = {
		left: `${left}px`,
		width: `${handleWidthPx}px`,
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: <hr> 在这里不适用
		<div
			className={styles.divider}
			style={dynamicStyles}
			onMouseDown={startDrag}
			onContextMenu={(e) => e.preventDefault()}
			role="separator"
			tabIndex={0}
			aria-orientation="vertical"
			aria-valuenow={timeMs}
			onKeyDown={handleKeyDown}
		/>
	);
};
