import { type createStore, useAtomValue } from "jotai";
import { useMemo } from "react";
import {
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
} from "$/states/main.ts";
import type { LyricLine, LyricWord } from "$/types/ttml";

export interface LineLocationResult {
	lines: LyricLine[];
	line: LyricLine;
	lineIndex: number;
}

export interface LineAndWordLocationResult extends LineLocationResult {
	word: LyricWord;
	wordIndex: number;
	isFirstWord: boolean;
	isLastWord: boolean;
}

export function getCurrentLineLocation(
	store: ReturnType<typeof createStore>,
): LineLocationResult | undefined {
	const lyricLines = store.get(lyricLinesAtom).lyricLines;
	const selectedLineId = [...store.get(selectedLinesAtom)][0]; // 进入打轴模式下一般不会出现多选的情况
	if (!selectedLineId) return;
	const lyricLine = lyricLines.findIndex((line) => line.id === selectedLineId);
	if (lyricLine === -1) return;
	return {
		lines: lyricLines,
		line: lyricLines[lyricLine],
		lineIndex: lyricLine,
	};
}

export function getCurrentLocation(
	store: ReturnType<typeof createStore>,
): LineAndWordLocationResult | undefined {
	const lyricLines = store.get(lyricLinesAtom).lyricLines;
	const selectedLineId = [...store.get(selectedLinesAtom)][0]; // 进入打轴模式下一般不会出现多选的情况
	if (!selectedLineId) return;
	const lyricLine = lyricLines.findIndex((line) => line.id === selectedLineId);
	if (lyricLine === -1) return;
	const selectedWordId = [...store.get(selectedWordsAtom)][0];
	if (!selectedWordId) return;
	const lyricWords = lyricLines[lyricLine].words;
	const lyricWord = lyricWords.findIndex((word) => word.id === selectedWordId);
	if (lyricWord === -1) return;
	const isFirstWord = !lyricWords
		.slice(0, lyricWord)
		.some(isSynchronizableWord);
	const isLastWord = !lyricWords
		.slice(lyricWord + 1)
		.some(isSynchronizableWord);
	return {
		lines: lyricLines,
		line: lyricLines[lyricLine],
		lineIndex: lyricLine,
		word: lyricWords[lyricWord],
		wordIndex: lyricWord,
		isFirstWord,
		isLastWord,
	};
}

export function useCurrentLocation(): LineAndWordLocationResult | undefined {
	const lyrics = useAtomValue(lyricLinesAtom);
	const selectedLines = useAtomValue(selectedLinesAtom);
	const selectedWords = useAtomValue(selectedWordsAtom);
	const result = useMemo(() => {
		const lyricLine = lyrics.lyricLines.findIndex((line) =>
			selectedLines.has(line.id),
		);
		if (lyricLine === -1) return;
		const lyricWords = lyrics.lyricLines[lyricLine].words;
		const lyricWord = lyricWords.findIndex((word) =>
			selectedWords.has(word.id),
		);
		if (lyricWord === -1) return;
		const isFirstWord = !lyricWords
			.slice(0, lyricWord)
			.some(isSynchronizableWord);
		const isLastWord = !lyricWords
			.slice(lyricWord + 1)
			.some(isSynchronizableWord);
		return {
			lines: lyrics.lyricLines,
			line: lyrics.lyricLines[lyricLine],
			lineIndex: lyricLine,
			word: lyricWords[lyricWord],
			wordIndex: lyricWord,
			isFirstWord,
			isLastWord,
		};
	}, [lyrics, selectedLines, selectedWords]);
	return result;
}

export const isSynchronizableWord = (word: LyricWord) =>
	word.word.trim().length > 0;
export const isSynchronizableLine = (line: LyricLine) => !line.ignoreSync;

export function findNextWord(
	lyricLines: LyricLine[],
	lineIndex: number,
	wordIndex: number,
):
	| {
			word: LyricWord;
			line: LyricLine;
	  }
	| undefined {
	const line = lyricLines[lineIndex];
	if (!line) return;
	const nextWord = line.words.slice(wordIndex + 1).find(isSynchronizableWord);
	if (!nextWord) {
		const nextLine = lyricLines.slice(lineIndex + 1).find(isSynchronizableLine);
		if (!nextLine) return;
		const nextWordForNextLine = nextLine.words.find(isSynchronizableWord);
		if (!nextWordForNextLine) return;
		return {
			line: nextLine,
			word: nextWordForNextLine,
		};
	}
	return {
		line,
		word: nextWord,
	};
}
