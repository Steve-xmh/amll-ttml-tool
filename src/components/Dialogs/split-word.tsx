import { splitWordDialogAtom } from "$/states/dialogs.ts";
import { lyricLinesAtom, splitWordStateAtom } from "$/states/main";
import { Info16Filled, Info16Regular } from "@fluentui/react-icons";
import {
	Button,
	Callout,
	Dialog,
	Flex,
	Separator,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useImmerAtom, useSetImmerAtom } from "jotai-immer";
import { memo, useMemo, useState } from "react";
import styles from "./split-word.module.css";
import type { LyricWord } from "@applemusic-like-lyrics/lyric";
import { newLyricWord } from "$/utils/ttml-types";

export const SplitWordDialog = memo(() => {
	const [splitWordDialog, splitWordDialogOpen] = useAtom(splitWordDialogAtom);
	const [splitState, setSplitState] = useImmerAtom(splitWordStateAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const [sparator, setSeparator] = useState("\\");
	const splittedWords = useMemo(
		() => splitState.word.split(sparator),
		[sparator, splitState.word],
	);

	return (
		<Dialog.Root open={splitWordDialog} onOpenChange={splitWordDialogOpen}>
			<Dialog.Content>
				<Dialog.Title>拆分/替换单词</Dialog.Title>
				<Flex direction="column" gap="2">
					<Callout.Root color="blue">
						<Callout.Icon>
							<Info16Regular />
						</Callout.Icon>
						<Callout.Text>
							拆分后新单词将会按自身单词字符平均分配原单词的始末时间，如有空拍则会被清除
						</Callout.Text>
					</Callout.Root>
					<Text>拆分/替换模板</Text>
					<TextField.Root
						value={splitState.word}
						onChange={(evt) =>
							setSplitState((state) => {
								state.word = evt.target.value;
							})
						}
					/>
					<Text mt="4">分隔符</Text>
					<TextField.Root
						value={sparator}
						onChange={(evt) => setSeparator(evt.target.value)}
					/>
					<Separator size="4" my="2" />
					<Text>拆分预览</Text>
					<Flex gap="1" wrap="wrap" mb="4">
						{splittedWords.map((w, i) => (
							<span className={styles.word} key={`preview-word-${i}-${w}`}>
								{w.trim() === "" ? (
									<Text color="gray">
										{w.length > 0 ? `空格x${w.length}` : "空白"}
									</Text>
								) : (
									w
								)}
							</span>
						))}
					</Flex>
				</Flex>
				<Dialog.Close>
					<Button
						onClick={() => {
							editLyricLines((state) => {
								const line = state.lyricLines[splitState.lineIndex];
								if (line) {
									const word = line.words[splitState.wordIndex];
									if (word) {
										const startTime = word.startTime;
										const endTime = word.endTime;
										const duration = endTime - startTime;
										const splittedDuration = duration / splittedWords.length;
										const newWords = splittedWords.map((w, i) => ({
											...newLyricWord(),
											startTime: startTime + splittedDuration * i,
											endTime: startTime + splittedDuration * (i + 1),
											word: w,
										}));
										line.words.splice(splitState.wordIndex, 1, ...newWords);
									}
								}
							});
						}}
					>
						拆分/替换
					</Button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Root>
	);
});
