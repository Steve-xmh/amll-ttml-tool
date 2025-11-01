import type { FC } from "react";
import type { LyricLine, LyricWord } from "$/utils/ttml-types";

interface LyricWordSegmentProps {
	word: LyricWord;
	line: LyricLine;
	zoom: number;
}

export const LyricWordSegment: FC<LyricWordSegmentProps> = ({
	word,
	line,
	zoom,
}) => {
	if (
		word.startTime == null ||
		word.endTime == null ||
		word.endTime <= word.startTime
	) {
		return null;
	}

	const left = ((word.startTime - line.startTime) / 1000) * zoom;
	const width = ((word.endTime - word.startTime) / 1000) * zoom;

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
			}}
		>
			{word.word}
		</div>
	);
};
