import { useAtomValue, useSetAtom } from "jotai";
import { type FC, useCallback } from "react";
import { dragDetailsAtom } from "$/states/dnd.ts";
import { processedLyricLinesAtom } from "$/utils/segment-processing.ts";
import {
	commitUpdatedLine,
	getUpdatedLineForDivider,
} from "$/utils/timeline-mutations.ts";
import styles from "./DividerSegment.module.css";

interface DividerSegmentProps {
	lineId: string;
	segmentIndex: number;
	timeMs: number;
	lineStartTime: number;
	zoom: number;
}

const DIVIDER_WIDTH_PX = 15;
const NUDGE_MS = 10;
const SHIFT_NUDGE_MS = 50;

export const DividerSegment: FC<DividerSegmentProps> = ({
	lineId,
	segmentIndex,
	timeMs,
	lineStartTime,
	zoom,
}) => {
	const setDragDetails = useSetAtom(dragDetailsAtom);
	const processedLines = useAtomValue(processedLyricLinesAtom);

	const startDrag = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragDetails({
				lineId: lineId,
				segmentIndex: segmentIndex,
				zoom: zoom,
				startX: e.clientX,
				isGapCreation: e.altKey,
			});
		},
		[lineId, segmentIndex, setDragDetails, zoom],
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

	const left = ((timeMs - lineStartTime) / 1000) * zoom - DIVIDER_WIDTH_PX / 2;

	const dynamicStyles = {
		left: `${left}px`,
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: <hr> 在这里不适用
		<div
			className={styles.divider}
			style={dynamicStyles}
			onMouseDown={startDrag}
			role="separator"
			tabIndex={0}
			aria-orientation="horizontal"
			aria-valuenow={timeMs}
			onKeyDown={handleKeyDown}
		/>
	);
};
