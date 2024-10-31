import { type createStore, useStore } from "jotai";
import { type FC, useCallback } from "react";
import {
	keyMoveNextLineAtom,
	keyMoveNextWordAtom,
	keyMovePrevLineAtom,
	keyMovePrevWordAtom,
	keySyncEndAtom,
	keySyncNextAtom,
	keySyncStartAtom,
} from "../../states/keybindings.ts";
import {
	currentLyricLinesAtom,
	currentTimeAtom,
	selectedLinesAtom,
	selectedWordsAtom,
} from "../../states/main.ts";
import { currentEmptyBeatAtom } from "../../states/sync.ts";
import { useKeyBindingAtom } from "../../utils/keybindings.ts";
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

const isSynchronizableWord = (word: LyricWord) => word.word.trim().length > 0;
const isSynchronizableLine = (line: LyricLine) => !line.ignoreSync;

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

export const SyncKeyBinding: FC = () => {
	const store = useStore();

	const moveToNextWord = useCallback(
		function moveToNextWord(): boolean {
			const location = getCurrentLocation(store);
			console.log("location", location);
			if (!location) return false;
			const nextWord = findNextWord(
				location.lines,
				location.lineIndex,
				location.wordIndex,
			);
			if (!nextWord) return false;
			store.set(selectedWordsAtom, new Set([nextWord.word.id]));
			store.set(selectedLinesAtom, new Set([nextWord.line.id]));
			store.set(currentEmptyBeatAtom, 0);
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
				const lastLine = location.lines
					.slice(0, lastLineIndex)
					.reverse()
					.find(isSynchronizableLine);
				if (!lastLine) return false;
				store.set(selectedLinesAtom, new Set([lastLine.id]));
				if (lastLine.words.length === 0) {
					store.set(selectedWordsAtom, new Set());
				} else {
					const lastWord = lastLine.words
						.slice()
						.reverse()
						.find(isSynchronizableWord);
					if (!lastWord) return false;
					store.set(selectedWordsAtom, new Set([lastWord.id]));
				}
			} else {
				const nextWord = location.line.words
					.slice(0, location.wordIndex - 1)
					.reverse()
					.find(isSynchronizableWord);
				if (!nextWord) return false;
				store.set(selectedWordsAtom, new Set([nextWord.id]));
			}
			return true;
		},
		[store],
	);

	// 移动打轴光标

	useKeyBindingAtom(
		keyMoveNextLineAtom,
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

	useKeyBindingAtom(
		keyMovePrevLineAtom,
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

	useKeyBindingAtom(keyMoveNextWordAtom, moveToNextWord, [store]);

	useKeyBindingAtom(keyMovePrevWordAtom, moveToPrevWord, [store]);

	// 记录时间戳（主要打轴按键）

	useKeyBindingAtom(
		keySyncStartAtom,
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
	useKeyBindingAtom(
		keySyncNextAtom,
		(evt) => {
			const location = getCurrentLocation(store);
			if (!location) return;
			const emptyBeat = store.get(currentEmptyBeatAtom);
			if (emptyBeat < location.word.emptyBeat) {
				store.set(currentEmptyBeatAtom, emptyBeat + 1);
				return;
			}
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
				if (nextWord) nextWord.word.startTime = currentTime | 0;
			});
			moveToNextWord();
		},
		[store, moveToNextWord],
	);
	useKeyBindingAtom(
		keySyncEndAtom,
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
