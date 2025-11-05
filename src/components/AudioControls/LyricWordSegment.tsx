import { useAtom } from "jotai";
import type { FC, KeyboardEvent, MouseEvent } from "react";
import { selectedWordIdAtom } from "$/states/dnd.ts";
import { audioEngine } from "$/utils/audio.ts";
import type { WordSegment } from "$/utils/segment-processing.ts";
import styles from "./LyricWordSegment.module.css";

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
	const [selectedWordId, setSelectedWordId] = useAtom(selectedWordIdAtom);

	const { startTime, endTime, word } = segment;

	if (startTime == null || endTime == null || endTime <= startTime) {
		return null;
	}

	const left = ((startTime - lineStartTime) / 1000) * zoom;
	const width = ((endTime - startTime) / 1000) * zoom;

	const isSelected = selectedWordId === segment.id;

	const handleClick = (e: MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		setSelectedWordId(segment.id);
	};

	const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setSelectedWordId(segment.id);
		if (startTime != null && endTime != null) {
			audioEngine.auditionRange(startTime / 1000, endTime / 1000);
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			setSelectedWordId(segment.id);
			if (startTime != null && endTime != null) {
				audioEngine.auditionRange(startTime / 1000, endTime / 1000);
			}
		}
	};

	const dynamicStyles = {
		left: `${left}px`,
		width: `${width}px`,
		backgroundColor: isSelected ? "var(--accent-a6)" : "transparent",
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: 在这里用 <button> 显然不正确
		<div
			className={styles.wordSegment}
			style={dynamicStyles}
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			role="button"
			tabIndex={0}
			onKeyDown={handleKeyDown}
		>
			{word}
		</div>
	);
};
