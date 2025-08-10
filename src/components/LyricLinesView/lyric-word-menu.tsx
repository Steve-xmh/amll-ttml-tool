import { splitWordDialogAtom } from "$/states/dialogs";
import {
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	splitWordStateAtom,
} from "$/states/main";
import { newLyricWord } from "$/utils/ttml-types";
import type { LyricWord } from "@applemusic-like-lyrics/lyric";
import { ContextMenu } from "@radix-ui/themes";
import { type Atom, atom, useAtomValue, useSetAtom, useStore } from "jotai";
import { useSetImmerAtom } from "jotai-immer";

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
	const setSplitState = useSetAtom(splitWordStateAtom);
	const word = useAtomValue(wordAtom);

	return (
		<>
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
							const selectedWordsInLine = line.words.filter((w) =>
								selectedWords.has(w.id),
							);

							if (selectedWordsInLine.length > 1) {
								const mergedWord = selectedWordsInLine
									.map((w) => w.word)
									.join("");
								const firstWord = selectedWordsInLine[0];
								const lastWord =
									selectedWordsInLine[selectedWordsInLine.length - 1];
								const firstIndex = line.words.indexOf(firstWord);

								const newWord = newLyricWord();
								newWord.word = mergedWord;
								newWord.startTime = firstWord.startTime;
								newWord.endTime = lastWord.endTime;

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
						}
					});
				}}
			>
				合并单词
			</ContextMenu.Item>
		</>
	);
};
