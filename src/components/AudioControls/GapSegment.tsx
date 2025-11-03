import type { FC } from "react";
import type { GapSegment as GapSegmentType } from "$/utils/segment-processing.ts";
import styles from "./GapSegment.module.css";

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

	const dynamicStyles = {
		left: `${left}px`,
		width: `${width}px`,
	};

	return <div className={styles.gapSegment} style={dynamicStyles} />;
};
