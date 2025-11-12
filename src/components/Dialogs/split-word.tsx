import { Info16Regular } from "@fluentui/react-icons";
import {
	Box,
	Button,
	Callout,
	Checkbox,
	Dialog,
	Flex,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useAtom, useAtomValue } from "jotai";
import { useImmerAtom, useSetImmerAtom } from "jotai-immer";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { splitWordDialogAtom } from "$/states/dialogs.ts";
import { lyricLinesAtom, splitWordStateAtom } from "$/states/main";
import { type LyricWord, newLyricWord } from "$/utils/ttml-types";
import { ManualWordSplitter } from "./ManualWordSplitter";

export const SplitWordDialog = memo(() => {
	const [splitWordDialog, splitWordDialogOpen] = useAtom(splitWordDialogAtom);
	const [splitState, setSplitState] = useImmerAtom(splitWordStateAtom);
	const lyricLines = useAtomValue(lyricLinesAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const { t } = useTranslation();

	const [splitIndices, setSplitIndices] = useState(new Set<number>());
	const [originalWord, setOriginalWord] = useState("");
	const [applyToAll, setApplyToAll] = useState(false);

	useEffect(() => {
		const line = lyricLines.lyricLines[splitState.lineIndex];
		const word = line?.words[splitState.wordIndex];

		if (word) {
			setOriginalWord(word.word);
			setSplitState((state) => {
				state.word = word.word;
			});
		} else {
			setOriginalWord("");
			setSplitState((state) => {
				state.word = "";
			});
		}

		setSplitIndices(new Set());
		setApplyToAll(false);
	}, [splitState.lineIndex, splitState.wordIndex, lyricLines, setSplitState]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 用来在外部单词发生变化时重置分割点
	useEffect(() => {
		setSplitIndices(new Set());
	}, [splitState.word]);

	const toggleSplitPoint = useCallback((index: number) => {
		setSplitIndices((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	}, []);

	return (
		<Dialog.Root open={splitWordDialog} onOpenChange={splitWordDialogOpen}>
			<Dialog.Content>
				<Dialog.Title>
					{t("splitWordDialog.title", "拆分/替换单词")}
				</Dialog.Title>
				<Flex direction="column" gap="2">
					<Callout.Root color="blue">
						<Callout.Icon>
							<Info16Regular />
						</Callout.Icon>
						<Callout.Text>
							{t(
								"splitWordDialog.tip",
								"拆分后新单词将会按自身单词字符平均分配原单词的始末时间，如有空拍则会被清除",
							)}
						</Callout.Text>
					</Callout.Root>
					<TextField.Root
						value={splitState.word}
						onChange={(evt) =>
							setSplitState((state) => {
								state.word = evt.target.value;
							})
						}
					/>
					<Box my="3">
						<ManualWordSplitter
							word={splitState.word}
							splitIndices={splitIndices}
							onSplitIndexToggle={toggleSplitPoint}
						/>
					</Box>
					<Text as="label" size="2">
						<Flex gap="2" align="center">
							<Checkbox
								checked={applyToAll}
								onCheckedChange={(c) => setApplyToAll(c as boolean)}
							/>
							{t(
								"splitWordDialog.applyToAll",
								"将此拆分/替换规则应用于所有相同的单词",
								{
									word: originalWord,
								},
							)}
						</Flex>
					</Text>
				</Flex>
				<Flex justify="end" mt="4">
					<Dialog.Close>
						<Button
							onClick={() => {
								const editedWord = splitState.word;

								const parts: string[] = [];
								let lastIndex = 0;
								const sortedIndices = Array.from(splitIndices).sort(
									(a, b) => a - b,
								);

								for (const index of sortedIndices) {
									parts.push(editedWord.slice(lastIndex, index));
									lastIndex = index;
								}
								parts.push(editedWord.slice(lastIndex));

								const splittedWords = parts.filter((p) => p !== "");

								if (splittedWords.length === 0 && editedWord) {
									splittedWords.push(editedWord);
								}

								const createNewWords = (targetWord: LyricWord): LyricWord[] => {
									const { startTime, endTime } = targetWord;
									const duration = endTime - startTime;

									if (duration <= 0 || splittedWords.length === 0) {
										return splittedWords.map((w) => ({
											...newLyricWord(),
											startTime,
											endTime,
											word: w,
										}));
									}

									const splittedDuration = duration / splittedWords.length;

									return splittedWords.map((w, i) => ({
										...newLyricWord(),
										startTime: (startTime + splittedDuration * i) | 0,
										endTime: (startTime + splittedDuration * (i + 1)) | 0,
										word: w,
									}));
								};

								editLyricLines((state) => {
									if (applyToAll) {
										const originalWordLower = originalWord.toLowerCase();
										for (const line of state.lyricLines) {
											line.words = line.words.flatMap((word) => {
												if (word.word.toLowerCase() === originalWordLower) {
													return createNewWords(word);
												}
												return word;
											});
										}
									} else {
										const line = state.lyricLines[splitState.lineIndex];
										if (line) {
											const word = line.words[splitState.wordIndex];
											if (word && word.word === originalWord) {
												line.words.splice(
													splitState.wordIndex,
													1,
													...createNewWords(word),
												);
											}
										}
									}
								});
							}}
						>
							{t("splitWordDialog.actionButton", "执行")}
						</Button>
					</Dialog.Close>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
});
