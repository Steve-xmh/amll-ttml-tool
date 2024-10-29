import { type createStore, useStore } from "jotai";
import { type FC, useCallback } from "react";
import {
	currentLyricLinesAtom,
	currentTimeAtom,
	selectedLinesAtom,
	selectedWordsAtom,
} from "../../states.ts";
import { useKeyBinding } from "../../utils/keybindings.ts";
import type { LyricLine, LyricWord } from "../../utils/ttml-types.ts";

function getCurrentLineLocation(store: ReturnType<typeof createStore>):
	| {
			lines: LyricLine[];
			line: LyricLine;
			lineIndex: number;
	  }
	| undefined {
	const lyricLines = store.get(currentLyricLinesAtom).lyricLines;
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

function getCurrentLocation(store: ReturnType<typeof createStore>):
	| {
			lines: LyricLine[];
			line: LyricLine;
			lineIndex: number;
			word: LyricWord;
			wordIndex: number;
	  }
	| undefined {
	const lyricLines = store.get(currentLyricLinesAtom).lyricLines;
	const selectedLineId = [...store.get(selectedLinesAtom)][0]; // 进入打轴模式下一般不会出现多选的情况
	if (!selectedLineId) return;
	const lyricLine = lyricLines.findIndex((line) => line.id === selectedLineId);
	if (lyricLine === -1) return;
	const selectedWordId = [...store.get(selectedWordsAtom)][0];
	if (!selectedWordId) return;
	const lyricWord = lyricLines[lyricLine].words.findIndex(
		(word) => word.id === selectedWordId,
	);
	if (lyricWord === -1) return;
	return {
		lines: lyricLines,
		line: lyricLines[lyricLine],
		lineIndex: lyricLine,
		word: lyricLines[lyricLine].words[lyricWord],
		wordIndex: lyricWord,
	};
}

function findNextWord(
	lyricLines: LyricLine[],
	lineIndex: number,
	wordIndex: number,
): LyricWord | undefined {
	const line = lyricLines[lineIndex];
	if (!line) return;
	const nextWord = line.words
		.slice(wordIndex + 1)
		.find((word) => word.word.trim().length > 0 && word.wordType !== "rt");
	if (!nextWord) return;
	return nextWord;
}

export const SyncKeyBinding: FC = () => {
	const store = useStore();

	const moveToNextWord = useCallback(
		function moveToNextWord(): boolean {
			const location = getCurrentLocation(store);
			if (!location) return false;
			if (location.wordIndex === location.line.words.length - 1) {
				const lastLineIndex = Math.min(
					location.lines.length - 1,
					location.lineIndex + 1,
				);
				const lastLine = location.lines[lastLineIndex];
				if (!lastLine) return false;
				store.set(selectedLinesAtom, new Set([lastLine.id]));
				if (lastLine.words.length === 0) {
					return false;
				}
				store.set(selectedWordsAtom, new Set([lastLine.words[0]?.id]));
			}
			const nextWord = findNextWord(
				location.lines,
				location.lineIndex,
				location.wordIndex,
			);
			if (!nextWord) return false;
			store.set(selectedWordsAtom, new Set([nextWord.id]));
			return true;
		},
		[store],
	);

	const moveToPrevWord = useCallback(
		function moveToPrevWord(): boolean {
			const location = getCurrentLocation(store);
			if (!location) return false;
			if (location.wordIndex === 0) {
				if (location.lineIndex === 0) return false;
				const lastLineIndex = Math.max(0, location.lineIndex - 1);
				const lastLine = location.lines[lastLineIndex];
				if (!lastLine) return false;
				store.set(selectedLinesAtom, new Set([lastLine.id]));
				if (lastLine.words.length === 0) {
					store.set(selectedWordsAtom, new Set());
				} else {
					const lastWord = lastLine.words[lastLine.words.length - 1];
					if (!lastWord) return false;
					store.set(selectedWordsAtom, new Set([lastWord.id]));
				}
			} else {
				const nextWord = location.line.words
					.slice(0, location.wordIndex - 1)
					.reverse()
					.find((word) => word.word.trim().length > 0);
				if (!nextWord) return false;
				store.set(selectedWordsAtom, new Set([nextWord.id]));
			}
			return true;
		},
		[store],
	);

	// 移动打轴光标

	useKeyBinding(
		["KeyS"],
		() => {
			const location = getCurrentLineLocation(store);
			if (!location) return;
			const lastLineIndex = Math.min(
				location.lines.length,
				location.lineIndex + 1,
			);
			const lastLine = location.lines[lastLineIndex];
			if (!lastLine) return;
			store.set(selectedLinesAtom, new Set([lastLine.id]));
			if (lastLine.words.length === 0) {
				store.set(selectedWordsAtom, new Set());
			} else {
				store.set(selectedWordsAtom, new Set([lastLine.words[0]?.id]));
			}
		},
		[store],
	);

	useKeyBinding(
		["KeyW"],
		() => {
			const location = getCurrentLineLocation(store);
			if (!location) return;
			const lastLineIndex = Math.max(0, location.lineIndex - 1);
			const lastLine = location.lines[lastLineIndex];
			if (!lastLine) return;
			store.set(selectedLinesAtom, new Set([lastLine.id]));
			if (lastLine.words.length === 0) {
				store.set(selectedWordsAtom, new Set());
			} else {
				store.set(selectedWordsAtom, new Set([lastLine.words[0]?.id]));
			}
		},
		[store],
	);

	useKeyBinding(["KeyD"], moveToNextWord, [store]);

	useKeyBinding(["KeyA"], moveToPrevWord, [store]);

	// 记录时间戳（主要打轴按键）

	useKeyBinding(
		["KeyF"],
		(evt) => {
			const location = getCurrentLocation(store);
			if (!location) return;
			const currentTime = Math.max(
				0,
				store.get(currentTimeAtom) - evt.downTimeOffset,
			);
			store.set(currentLyricLinesAtom, (state) => {
				state.lyricLines[location.lineIndex].words[
					location.wordIndex
				].startTime = currentTime | 0;
			});
		},
		[store],
	);
	useKeyBinding(
		["KeyG"],
		(evt) => {
			const location = getCurrentLocation(store);
			if (!location) return;
			const currentTime = Math.max(
				0,
				store.get(currentTimeAtom) - evt.downTimeOffset,
			);
			store.set(currentLyricLinesAtom, (state) => {
				state.lyricLines[location.lineIndex].words[location.wordIndex].endTime =
					currentTime | 0;
				const nextWord = findNextWord(
					state.lyricLines,
					location.lineIndex,
					location.wordIndex,
				);
				if (nextWord) nextWord.startTime = currentTime | 0;
			});
			moveToNextWord();
		},
		[store, moveToNextWord],
	);
	useKeyBinding(
		["KeyH"],
		(evt) => {
			const location = getCurrentLocation(store);
			if (!location) return;
			const currentTime = Math.max(
				0,
				store.get(currentTimeAtom) - evt.downTimeOffset,
			);
			store.set(currentLyricLinesAtom, (state) => {
				state.lyricLines[location.lineIndex].words[location.wordIndex].endTime =
					currentTime | 0;
			});
			moveToNextWord();
		},
		[store, moveToNextWord],
	);

	return null;
};
