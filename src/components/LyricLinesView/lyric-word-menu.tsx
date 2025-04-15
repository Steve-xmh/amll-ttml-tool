import { splitWordDialogAtom } from "$/states/dialogs";
import {
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	splitWordStateAtom,
} from "$/states/main";
import { newLyricWord } from "$/utils/ttml-types";
import type { LyricWord } from "@applemusic-like-lyrics/lyric";
import { ContextMenu, Dialog } from "@radix-ui/themes";
import { atom, useAtomValue, useSetAtom, useStore, type Atom } from "jotai";
import { useSetImmerAtom } from "jotai-immer";
import { useMemo } from "react";

const selectedLinesSizeAtom = atom((get) => get(selectedLinesAtom).size);
const selectedWordsSizeAtom = atom((get) => get(selectedWordsAtom).size);

export const LyricWordMenu = ({
	wordIndex,
	wordAtom,
	lineIndex,
}: {
	wordIndex: number;
	wordAtom: Atom<LyricWord>;
	lineIndex: number;
}) => {
	const store = useStore();
	const selectedWordsSize = useAtomValue(selectedWordsSizeAtom);
	const selectedLinesSize = useAtomValue(selectedLinesSizeAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const setOpenSplitWordDialog = useSetAtom(splitWordDialogAtom);
	const word = useAtomValue(wordAtom);
	const setSplitState = useSetAtom(splitWordStateAtom);

	return (
		<ContextMenu.Content>
			<ContextMenu.Item
				disabled={selectedWordsSize === 0}
				onClick={() => {
					editLyricLines((state) => {
						const selectedWords = store.get(selectedWordsAtom);
						for (const line of state.lyricLines) {
							line.words = line.words.filter((w) => !selectedWords.has(w.id));
						}
					});
				}}
			>
				删除所选单词
			</ContextMenu.Item>
			<ContextMenu.Item
				disabled={selectedWordsSize !== 1}
				onClick={() => {
					setSplitState({
						wordIndex,
						lineIndex,
						word: word.word,
					});
					setOpenSplitWordDialog(true);
				}}
			>
				拆分此单词/在此处替换单词
			</ContextMenu.Item>
			<ContextMenu.Item
				disabled={!(selectedWordsSize > 1 && selectedLinesSize === 1)}
				onClick={() => {
					editLyricLines((state) => {
						const selectedWords = store.get(selectedWordsAtom);
						const line = state.lyricLines[lineIndex];
						if (line) {
							let firstIndex = -1;
							let mergedWord = "";
							for (const w of line.words) {
								if (selectedWords.has(w.id)) {
									mergedWord += w.word;
									if (firstIndex === -1) {
										firstIndex = line.words.indexOf(w);
									}
								}
							}
							const newWord = newLyricWord();
							newWord.word = mergedWord;
							newWord.startTime = line.words[wordIndex].startTime;
							state.lyricLines[lineIndex].words = line.words.filter(
								(w) => !selectedWords.has(w.id),
							);
							if (firstIndex !== -1) {
								state.lyricLines[lineIndex].words.splice(
									firstIndex,
									0,
									newWord,
								);
							}
						}
					});
				}}
			>
				合并单词
			</ContextMenu.Item>
		</ContextMenu.Content>
	);
};
