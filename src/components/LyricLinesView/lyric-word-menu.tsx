import { splitWordDialogAtom } from "$/states/dialogs";
import {
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	splitWordStateAtom,
} from "$/states/main";
import {
	type LyricLine,
	type LyricWord,
	newLyricLine,
	newLyricWord,
} from "$/utils/ttml-types";
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
				disabled={selectedWordsSize !== 1}
				onSelect={() => {
					setSplitState({
						wordIndex,
						lineIndex,
						word: word.word,
					});
					setOpenSplitWordDialog(true);
				}}
			>
				拆分或替换单词…
			</ContextMenu.Item>
			<ContextMenu.Item
				disabled={!(selectedWordsSize > 1 && selectedLinesSize === 1)}
				onSelect={() => {
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

			<ContextMenu.Item
				disabled={selectedWordsSize === 0}
				onSelect={() => {
					editLyricLines((state) => {
						const selectedWords = store.get(selectedWordsAtom);
						for (const line of state.lyricLines) {
							const originalLength = line.words.length;
							const filteredWords = line.words.filter(
								(w) => !selectedWords.has(w.id),
							);
							line.words = filteredWords;
							if (originalLength !== filteredWords.length)
								normalizeLineTime(line);
						}
					});
				}}
			>
				删除单词
			</ContextMenu.Item>

			<ContextMenu.Separator />

			<ContextMenu.Item
				disabled={selectedWordsSize !== 1}
				onSelect={() => afterToNewLine()}
			>
				此后单词拆至新行
			</ContextMenu.Item>

			<ContextMenu.Item
				disabled={selectedWordsSize === 0}
				onSelect={() => selectedToNewLine()}
			>
				所选单词拆至新行
			</ContextMenu.Item>

			<ContextMenu.Separator />
		</>
	);

	function selectedToNewLine() {
		editLyricLines((state) => {
			const selectedWordIds = store.get(selectedWordsAtom);
			const selectedWords: LyricWord[] = [];
			const affectedLines: LyricLine[] = [];
			for (const line of state.lyricLines) {
				line.words = line.words.filter((w) => {
					if (selectedWordIds.has(w.id)) {
						selectedWords.push(w);
						affectedLines.push(line);
						return false;
					}
					return true;
				});
			}
			const newLine = {
				...newLyricLine(),
				isBG: state.lyricLines[lineIndex].isBG,
				isDuet: state.lyricLines[lineIndex].isDuet,
			} as LyricLine;
			newLine.words.push(...selectedWords);
			normalizeLineTime(newLine);
			affectedLines.forEach(normalizeLineTime);
			state.lyricLines.splice(lineIndex + 1, 0, newLine);
		});
	}

	function afterToNewLine() {
		editLyricLines((state) => {
			const line = state.lyricLines[lineIndex];
			if (!line) return;
			const word = line.words[wordIndex];
			if (!word) return;
			if (/^\s*$/.test(word.word) && !word.startTime && !word.endTime)
				line.words.splice(wordIndex, 1);
			const wordsToMove = line.words.splice(wordIndex);
			const newLine = {
				...newLyricLine(),
				isBG: line.isBG,
				isDuet: line.isDuet,
			} as LyricLine;
			newLine.words.push(...wordsToMove);
			normalizeLineTime(line);
			normalizeLineTime(newLine);
			state.lyricLines.splice(lineIndex + 1, 0, newLine);
		});
	}

	function normalizeLineTime(line: LyricLine) {
		if (line.words.length === 0) return;
		line.startTime = line.words[0].startTime;
		line.endTime = line.words[line.words.length - 1].endTime;
	}
};
