import { useAtomValue } from "jotai";
import React, { type FC } from "react";
import { previewLineAtom } from "$/states/dnd.ts";
import type { ProcessedLyricLine } from "$/utils/segment-processing.ts";
import { DividerSegment } from "./DividerSegment.tsx";
import { GapSegment } from "./GapSegment.tsx";
import { LyricWordSegment } from "./LyricWordSegment.tsx";

interface LyricLineSegmentProps {
	line: ProcessedLyricLine;
	zoom: number;
}

export const LyricLineSegment: FC<LyricLineSegmentProps> = ({ line, zoom }) => {
	const previewLine = useAtomValue(previewLineAtom);

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

	if (startTime == null || endTime == null || endTime <= startTime) {
		return null;
	}

	const left = (startTime / 1000) * zoom;
	const width = ((endTime - startTime) / 1000) * zoom;

	if (width < 1) {
		return null;
	}

	return (
		<div
			style={{
				left: `${left}px`,
				width: `${width}px`,
				height: "100%",
				backgroundColor: "var(--accent-a3)",
				border: "1px solid var(--accent-11)",
				borderRadius: "var(--radius-2)",
				position: "absolute",
				boxSizing: "border-box",
				pointerEvents: "none",
			}}
		>
			<DividerSegment
				key="divider-start"
				lineId={displayLine.id}
				segmentIndex={-1}
				timeMs={startTime}
				lineStartTime={startTime}
				zoom={zoom}
			/>

			{segments.map((segment, index) => (
				<React.Fragment key={segment.id}>
					{segment.type === "word" ? (
						<LyricWordSegment
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
						key={`divider-${index}`}
						lineId={displayLine.id}
						segmentIndex={index}
						timeMs={segment.endTime}
						lineStartTime={startTime}
						zoom={zoom}
					/>
				</React.Fragment>
			))}
		</div>
	);
};
