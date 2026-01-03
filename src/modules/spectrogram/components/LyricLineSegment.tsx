import { useAtomValue, useSetAtom } from "jotai";
import React, { type FC, useCallback, useContext } from "react";
import type { ProcessedLyricLine } from "$/modules/segmentation/utils/segment-processing.ts";
import {
	previewLineAtom,
	selectedWordIdAtom,
} from "$/modules/spectrogram/states/dnd.ts";
import { editingTimeFieldAtom, selectedLinesAtom } from "$/states/main.ts";
import { DividerSegment } from "./DividerSegment.tsx";
import { GapSegment } from "./GapSegment.tsx";
import styles from "./LyricLineSegment.module.css";
import { LyricWordSegment } from "./LyricWordSegment.tsx";
import { SpectrogramContext } from "./SpectrogramContext.ts";

interface LyricLineSegmentProps {
	line: ProcessedLyricLine;
	allLines: ProcessedLyricLine[];
}

export const LyricLineSegment: FC<LyricLineSegmentProps> = ({
	line,
	allLines,
}) => {
	const previewLine = useAtomValue(previewLineAtom);
	const setSelectedLines = useSetAtom(selectedLinesAtom);
	const setSelectedWordId = useSetAtom(selectedWordIdAtom);
	const { zoom } = useContext(SpectrogramContext);
	const editingTimeField = useAtomValue(editingTimeFieldAtom);

	let displayLine: ProcessedLyricLine;
	if (previewLine && previewLine.id === line.id) {
		displayLine = previewLine;
	} else {
		displayLine = line;
	}

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (editingTimeField) return;

			if (!displayLine) return;
			e.stopPropagation();

			const { id } = displayLine;

			setSelectedLines(new Set([id]));
			setSelectedWordId(null);
		},
		[editingTimeField, displayLine, setSelectedLines, setSelectedWordId],
	);

	if (!displayLine) {
		return null;
	}

	const { startTime, endTime, segments } = displayLine;
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

	const dynamicStyles = {
		left: `${left}px`,
		width: `${width}px`,
		cursor: "auto",
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: <button> 不适用
		<div
			className={styles.lineSegment}
			style={dynamicStyles}
			onMouseDown={handleMouseDown}
			tabIndex={0}
			role="button"
			aria-label="Lyric Line"
		>
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
						isTouching={index === segmentsLength - 1 ? isTouchingEnd : false}
					/>
				</React.Fragment>
			))}
		</div>
	);
};
