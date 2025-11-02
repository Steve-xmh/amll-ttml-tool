import type { FC } from "react";
import type { WordSegment } from "$/utils/segment-processing.ts";

interface LyricWordSegmentProps {
	segment: WordSegment;
	lineStartTime: number;
	zoom: number;
}

export const LyricWordSegment: FC<LyricWordSegmentProps> = ({
	segment,
	lineStartTime,
	zoom,
}) => {
	const { startTime, endTime, word } = segment;

	if (startTime == null || endTime == null || endTime <= startTime) {
		return null;
	}

	const left = ((startTime - lineStartTime) / 1000) * zoom;
	const width = ((endTime - startTime) / 1000) * zoom;

	return (
		<div
			style={{
				position: "absolute",
				left: `${left}px`,
				width: `${width}px`,
				top: "0",
				height: "100%",
				border: "1px solid var(--accent-12)",
				borderRadius: "var(--radius-1)",
				color: "var(--gray-12)",
				display: "flex",
				alignItems: "normal",
				justifyContent: "center",
				userSelect: "none",
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis",
				padding: "0 4px",
				fontSize: "15px",
				boxSizing: "border-box",
				pointerEvents: "none",
			}}
		>
			{word}
		</div>
	);
};
