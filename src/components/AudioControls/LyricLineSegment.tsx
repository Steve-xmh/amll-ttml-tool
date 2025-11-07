import { useAtomValue, useSetAtom } from "jotai";
import React, { type FC } from "react";
import { previewLineAtom, selectedWordIdAtom } from "$/states/dnd.ts";
import type { ProcessedLyricLine } from "$/utils/segment-processing.ts";
import { DividerSegment } from "./DividerSegment.tsx";
import { GapSegment } from "./GapSegment.tsx";
import styles from "./LyricLineSegment.module.css";
import { LyricWordSegment } from "./LyricWordSegment.tsx";

interface LyricLineSegmentProps {
	line: ProcessedLyricLine;
	zoom: number;
	allLines: ProcessedLyricLine[];
}

export const LyricLineSegment: FC<LyricLineSegmentProps> = ({
	line,
	zoom,
	allLines,
}) => {
	const previewLine = useAtomValue(previewLineAtom);
	const setSelectedWordId = useSetAtom(selectedWordIdAtom);

	let displayLine: ProcessedLyricLine;
	if (previewLine && previewLine.id === line.id) {
		displayLine = previewLine;
	} else {
		displayLine = line;
	}

	if (!displayLine) {
		return null;
	}

	const { startTime, endTime, segments } = displayLine;
	const segmentsLength = segments.length;

	const handleBackgroundClick = () => {
		setSelectedWordId(null);
	};

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
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: 此功能仅限鼠标
		// biome-ignore lint/a11y/noStaticElementInteractions: 此功能仅限鼠标
		<div
			className={styles.lineSegment}
			style={dynamicStyles}
			onClick={handleBackgroundClick}
		>
			<DividerSegment
				key="divider-start"
				lineId={displayLine.id}
				segmentIndex={-1}
				timeMs={startTime}
				lineStartTime={startTime}
				zoom={zoom}
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
							zoom={zoom}
						/>
					) : (
						<GapSegment
							segment={segment}
							lineStartTime={startTime}
							zoom={zoom}
						/>
					)}
					<DividerSegment
						key={`divider-${segment.id}`}
						lineId={displayLine.id}
						segmentIndex={index}
						timeMs={segment.endTime}
						lineStartTime={startTime}
						zoom={zoom}
						segmentsLength={segmentsLength}
						isTouching={index === segmentsLength - 1 ? isTouchingEnd : false}
					/>
				</React.Fragment>
			))}
		</div>
	);
};
