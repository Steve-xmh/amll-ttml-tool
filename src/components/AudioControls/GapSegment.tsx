import type { FC } from "react";
import type { GapSegment as GapSegmentType } from "$/utils/segment-processing.ts";

interface GapSegmentProps {
	segment: GapSegmentType;
	lineStartTime: number;
	zoom: number;
}

export const GapSegment: FC<GapSegmentProps> = ({
	segment,
	lineStartTime,
	zoom,
}) => {
	const { startTime, endTime } = segment;

	if (startTime == null || endTime == null || endTime <= startTime) {
		return null;
	}

	const left = ((startTime - lineStartTime) / 1000) * zoom;
	const width = ((endTime - startTime) / 1000) * zoom;

	if (width < 1) {
		return null;
	}

	return (
		<div
			style={{
				position: "absolute",
				left: `${left}px`,
				width: `${width}px`,
				top: "0",
				height: "100%",
				boxSizing: "border-box",
				pointerEvents: "none",
				background:
					"repeating-linear-gradient(45deg, var(--gray-a4), var(--gray-a4) 5px, var(--gray-a3) 5px, var(--gray-a3) 10px)",
				border: "1px solid var(--accent-12)",
				borderRadius: "var(--radius-1)",
			}}
		/>
	);
};
