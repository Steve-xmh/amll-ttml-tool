import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { selectedWordIdAtom } from "$/states/dnd.ts";
import {
	keyAuditionSelectionAfterAtom,
	keyAuditionSelectionAtom,
	keyAuditionSelectionBeforeAtom,
} from "$/states/keybindings.ts";
import { audioEngine } from "$/utils/audio.ts";
import { useKeyBindingAtom } from "$/utils/keybindings.ts";
import {
	processedLyricLinesAtom,
	type WordSegment,
} from "$/utils/segment-processing.ts";

/**
 * 试听片段前后的时长 (毫秒)
 */
const AUDITION_PADDING_MS = 500;

export const AuditionKeyBinding = () => {
	const selectedWordId = useAtomValue(selectedWordIdAtom);
	const processedLines = useAtomValue(processedLyricLinesAtom);

	const selectedSegment = useMemo(() => {
		if (!selectedWordId) return null;

		for (const line of processedLines) {
			const segment = line.segments.find(
				(s) => s.type === "word" && s.id === selectedWordId,
			);
			if (segment) return segment as WordSegment;
		}
		return null;
	}, [selectedWordId, processedLines]);

	// 播放选中片段前 500ms
	useKeyBindingAtom(keyAuditionSelectionBeforeAtom, () => {
		if (!selectedSegment?.startTime) return;

		audioEngine.auditionRange(
			(selectedSegment.startTime - AUDITION_PADDING_MS) / 1000,
			selectedSegment.startTime / 1000,
		);
	}, [selectedSegment]);

	// 播放选中的片段
	useKeyBindingAtom(keyAuditionSelectionAtom, () => {
		if (!selectedSegment?.startTime || !selectedSegment?.endTime) return;

		audioEngine.auditionRange(
			selectedSegment.startTime / 1000,
			selectedSegment.endTime / 1000,
		);
	}, [selectedSegment]);

	// 播放选中片段后 500ms
	useKeyBindingAtom(keyAuditionSelectionAfterAtom, () => {
		if (!selectedSegment?.endTime) return;

		audioEngine.auditionRange(
			selectedSegment.endTime / 1000,
			(selectedSegment.endTime + AUDITION_PADDING_MS) / 1000,
		);
	}, [selectedSegment]);

	return null;
};
