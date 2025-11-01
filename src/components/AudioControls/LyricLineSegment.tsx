import type { FC } from "react";
import type { LyricLine } from "$/utils/ttml-types";
import { LyricWordSegment } from "./LyricWordSegment";

interface LyricLineSegmentProps {
	line: LyricLine;
	zoom: number;
}

export const LyricLineSegment: FC<LyricLineSegmentProps> = ({ line, zoom }) => {
	const { startTime, endTime } = line;

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
			}}
		>
			{line.words.map((word) => (
				<LyricWordSegment key={word.id} word={word} line={line} zoom={zoom} />
			))}
		</div>
	);
};
