import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	type FC,
	type KeyboardEvent,
	type MouseEvent,
	useContext,
} from "react";
import { spectrogramScrollLeftAtom } from "$/states/audio.ts";
import { selectedWordIdAtom, wordPanOperationAtom } from "$/states/dnd.ts";
import { audioEngine } from "$/utils/audio.ts";
import type { WordSegment } from "$/utils/segment-processing.ts";
import styles from "./LyricWordSegment.module.css";
import { SpectrogramContext } from "./SpectrogramContext";

interface LyricWordSegmentProps {
	lineId: string;
	segment: WordSegment;
	lineStartTime: number;
	zoom: number;
}

export const LyricWordSegment: FC<LyricWordSegmentProps> = ({
	lineId,
	segment,
	lineStartTime,
	zoom,
}) => {
	const [selectedWordId, setSelectedWordId] = useAtom(selectedWordIdAtom);
	const setWordPanOperation = useSetAtom(wordPanOperationAtom);
	const scrollLeft = useAtomValue(spectrogramScrollLeftAtom);
	const scrollContainerRef = useContext(SpectrogramContext);

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

	const handlePanStart = (e: MouseEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;

		e.preventDefault();
		e.stopPropagation();

		const scrollContainer = scrollContainerRef.current;
		if (!scrollContainer) return;
		const rect = scrollContainer.getBoundingClientRect();

		const mouseXPx = e.clientX - rect.left;
		const initialMouseTimeMS = ((scrollLeft + mouseXPx) / zoom) * 1000;

		setWordPanOperation({
			type: "word-pan",
			lineId: lineId,
			wordId: segment.id,
			initialMouseTimeMS,
			initialWordStartMS: segment.startTime,
		});

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
			onMouseDown={handlePanStart}
			onContextMenu={handleContextMenu}
			role="button"
			tabIndex={0}
			onKeyDown={handleKeyDown}
		>
			{word}
		</div>
	);
};
