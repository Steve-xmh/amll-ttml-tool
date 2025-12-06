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
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { splitWordDialogAtom } from "$/states/dialogs.ts";
import { lyricLinesAtom, splitWordStateAtom } from "$/states/main";
import {
	segmentationCustomRulesAtom,
	segmentationIgnoreListTextAtom,
	segmentationLangAtom,
	segmentationPunctuationModeAtom,
	segmentationPunctuationWeightAtom,
	segmentationRemoveEmptySegmentsAtom,
	segmentationSplitCJKAtom,
	segmentationSplitEnglishAtom,
} from "$/states/segmentation.ts";
import { loadHyphenator } from "$/utils/hyphen-loader.ts";
import { segmentWord } from "$/utils/segmentation.ts";
import type {
	HyphenatorFunc,
	SegmentationConfig,
} from "$/utils/segmentation-types.ts";
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

	const splitCJK = useAtomValue(segmentationSplitCJKAtom);
	const splitEnglish = useAtomValue(segmentationSplitEnglishAtom);
	const punctuationMode = useAtomValue(segmentationPunctuationModeAtom);
	const punctuationWeight = useAtomValue(segmentationPunctuationWeightAtom);
	const removeEmptySegments = useAtomValue(segmentationRemoveEmptySegmentsAtom);
	const ignoreListText = useAtomValue(segmentationIgnoreListTextAtom);
	const customRules = useAtomValue(segmentationCustomRulesAtom);
	const lang = useAtomValue(segmentationLangAtom);
	const [activeHyphenator, setActiveHyphenator] = useState<
		HyphenatorFunc | undefined
	>(undefined);

	useEffect(() => {
		let isMounted = true;

		const fetchHyphenator = async () => {
			const func = await loadHyphenator(lang);
			if (isMounted && func) {
				setActiveHyphenator(() => func);
			}
		};

		fetchHyphenator();

		return () => {
			isMounted = false;
		};
	}, [lang]);

	const ignoreList = useMemo(() => {
		return new Set(
			ignoreListText.split("\n").filter((line) => line.trim() !== ""),
		);
	}, [ignoreListText]);

	const segmentationConfig = useMemo((): SegmentationConfig => {
		const weight = parseFloat(punctuationWeight);
		const finalPunctuationWeight = Number.isNaN(weight) ? 0.2 : weight;

		return {
			splitCJK,
			splitEnglish,
			punctuationMode,
			punctuationWeight: finalPunctuationWeight,
			removeEmptySegments,
			ignoreList,
			customRules,
			hyphenator: activeHyphenator,
		};
	}, [
		splitCJK,
		splitEnglish,
		punctuationMode,
		punctuationWeight,
		removeEmptySegments,
		ignoreList,
		customRules,
		activeHyphenator,
	]);

	useEffect(() => {
		if (!splitWordDialog) {
			return;
		}
		const line = lyricLines.lyricLines[splitState.lineIndex];
		const word = line?.words[splitState.wordIndex];

		if (word) {
			setOriginalWord(word.word);
			setSplitState((state) => {
				state.word = word.word;
			});

			const resultWords = segmentWord(word, segmentationConfig);
			if (resultWords.length > 1) {
				const indices = new Set<number>();
				let currentIndex = 0;
				for (let i = 0; i < resultWords.length - 1; i++) {
					currentIndex += resultWords[i].word.length;
					indices.add(currentIndex);
				}
				setSplitIndices(indices);
			} else {
				setSplitIndices(new Set());
			}
		} else {
			setOriginalWord("");
			setSplitState((state) => {
				state.word = "";
			});
			setSplitIndices(new Set());
		}

		setApplyToAll(false);
	}, [
		splitWordDialog,
		splitState.lineIndex,
		splitState.wordIndex,
		lyricLines,
		setSplitState,
		segmentationConfig,
	]);

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
						onChange={(evt) => {
							setSplitState((state) => {
								state.word = evt.target.value;
							});
							setSplitIndices(new Set());
						}}
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
