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
}

export const LyricLineSegment: FC<LyricLineSegmentProps> = ({ line, zoom }) => {
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
						key={`divider-${segment.id}`}
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
