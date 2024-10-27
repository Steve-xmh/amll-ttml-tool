/*
 * Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { Text, TextField } from "@radix-ui/themes";
import classNames from "classnames";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type FC, useMemo, useState } from "react";
import {
	currentLyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	ToolMode,
	toolModeAtom,
} from "../../states";
import type { LyricLine, LyricWord } from "../../utils/ttml-types";
import styles from "./index.module.css";
import { motion } from "framer-motion";
import { msToTimestamp } from "../../utils/timestamp";

export const LyricWordView: FC<{
	word: LyricWord;
	wordIndex: number;
	line: LyricLine;
	lineIndex: number;
}> = ({ word, wordIndex, line, lineIndex }) => {
	const [editing, setEditing] = useState(false);
	const [selectedWords, setSelectedWords] = useAtom(selectedWordsAtom);
	const toolMode = useAtomValue(toolModeAtom);
	const setSelectedLines = useSetAtom(selectedLinesAtom);
	const editLyricLines = useSetAtom(currentLyricLinesAtom);

	const isWordBlank = useMemo(
		() =>
			word.word.length === 0 ||
			(word.word.length > 0 && word.word.trim().length === 0),
		[word.word],
	);
	const displayWord = useMemo(() => {
		if (word.word === "") return "空白";
		if (isWordBlank) return `空格 x${word.word.length}`;
		return word.word;
	}, [word.word, isWordBlank]);

	const displayWordLayoutId = useMemo(
		() => `lyric-display-word-${word.id}`,
		[word.id],
	);

	const className = useMemo(
		() =>
			classNames(
				styles.lyricWord,
				toolMode === ToolMode.Edit && styles.edit,
				toolMode === ToolMode.Sync && styles.sync,
				selectedWords.has(word.id) && styles.selected,
				isWordBlank && styles.blank,
			),
		[isWordBlank, toolMode, selectedWords, word.id],
	);

	return (
		<motion.div layout>
			{toolMode === ToolMode.Edit &&
				(editing ? (
					<TextField.Root
						autoFocus
						defaultValue={word.word}
						onBlur={() => {
							setEditing(false);
						}}
						onKeyDown={(evt) => {
							if (evt.key === "Enter") {
								setEditing(false);
								const newWord = evt.currentTarget.value;
								if (newWord !== word.word) {
									editLyricLines((state) => {
										state.lyricLines[lineIndex].words[wordIndex].word = newWord;
									});
								}
							}
						}}
					/>
				) : (
					<motion.span
						layoutId={displayWordLayoutId}
						className={className}
						onDoubleClick={() => {
							setEditing(true);
						}}
						onClick={(evt) => {
							evt.stopPropagation();
							evt.preventDefault();
							if (evt.ctrlKey) {
								setSelectedWords((v) => {
									const n = new Set(v);
									if (n.has(word.id)) {
										n.delete(word.id);
									} else {
										n.add(word.id);
									}
									return n;
								});
							} else {
								setSelectedLines(new Set([line.id]));
								setSelectedWords(new Set([word.id]));
							}
						}}
					>
						{displayWord}
					</motion.span>
				))}
			{toolMode === ToolMode.Sync && !isWordBlank && (
				<motion.div className={className}>
					<div className={styles.startTime}>{msToTimestamp(word.startTime)}</div>
					<motion.div className={styles.displayWord} layout layoutId={displayWordLayoutId}>{displayWord}</motion.div>
					<div className={styles.endTime}>{msToTimestamp(word.endTime)}</div>
				</motion.div>
			)}
		</motion.div>
	);
};

export default LyricWordView;
