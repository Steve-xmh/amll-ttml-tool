/*
 * Copyright 2023-2025 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import {
	ToolMode,
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	toolModeAtom,
} from "$/states/main.ts";
import { visualizeTimestampUpdateAtom } from "$/states/sync.ts";
import { msToTimestamp } from "$/utils/timestamp.ts";
import type { LyricLine, LyricWord } from "$/utils/ttml-types.ts";
import { ContextMenu, TextField } from "@radix-ui/themes";
import classNames from "classnames";
import {
	type Atom,
	atom,
	useAtom,
	useAtomValue,
	useSetAtom,
	useStore,
} from "jotai";
import { useSetImmerAtom } from "jotai-immer";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.css";

const isDraggingAtom = atom(false);
const draggingIdAtom = atom("");

const useWordBlank = (word: string) =>
	useMemo(
		() => word.length === 0 || (word.length > 0 && word.trim().length === 0),
		[word],
	);

const LyricWorldViewEdit = ({
	wordAtom,
	wordIndex,
	line,
	lineIndex,
}: {
	wordAtom: Atom<LyricWord>;
	wordIndex: number;
	line: LyricLine;
	lineIndex: number;
}) => {
	const word = useAtomValue(wordAtom);
	const store = useStore();
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const setSelectedLines = useSetAtom(selectedLinesAtom);
	const [selectedWords, setSelectedWords] = useAtom(selectedWordsAtom);
	const [editing, setEditing] = useState(false);
	const toolMode = useAtomValue(toolModeAtom);

	const isWordBlank = useWordBlank(word.word);
	const displayWord = useDisplayWord(word.word, isWordBlank);

	const className = useMemo(
		() =>
			classNames(
				styles.lyricWord,
				styles.edit,
				selectedWords.has(word.id) && styles.selected,
				isWordBlank && styles.blank,
			),
		[isWordBlank, selectedWords, word],
	);

	return editing ? (
		<TextField.Root
			autoFocus
			defaultValue={word.word}
			onBlur={(evt) => {
				setEditing(false);
				const newWord = evt.currentTarget.value;
				if (newWord !== word.word) {
					editLyricLines((state) => {
						state.lyricLines[lineIndex].words[wordIndex].word = newWord;
					});
				}
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
		<ContextMenu.Root>
			<ContextMenu.Trigger>
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<span
					draggable={toolMode === ToolMode.Edit}
					onDragStart={(evt) => {
						evt.dataTransfer.dropEffect = "move";
						store.set(isDraggingAtom, true);
						store.set(draggingIdAtom, word.id);
						evt.stopPropagation();
					}}
					onDragEnd={() => {
						store.set(isDraggingAtom, false);
					}}
					onDragOver={(evt) => {
						if (!store.get(isDraggingAtom)) return;
						if (store.get(draggingIdAtom) === word.id) return;
						if (selectedWords.has(word.id)) return;
						evt.preventDefault();
						evt.dataTransfer.dropEffect = "move";
						const rect = evt.currentTarget.getBoundingClientRect();
						const innerX = evt.clientX - rect.left;
						if (innerX < rect.width / 2) {
							evt.currentTarget.classList.add(styles.dropLeft);
							evt.currentTarget.classList.remove(styles.dropRight);
						} else {
							evt.currentTarget.classList.remove(styles.dropLeft);
							evt.currentTarget.classList.add(styles.dropRight);
						}
					}}
					onDrop={(evt) => {
						evt.currentTarget.classList.remove(styles.dropLeft);
						evt.currentTarget.classList.remove(styles.dropRight);
						if (!store.get(isDraggingAtom)) return;
						const rect = evt.currentTarget.getBoundingClientRect();
						const innerX = evt.clientX - rect.left;
						const targetIds = new Set(selectedWords);
						const draggingId = store.get(draggingIdAtom);
						if (!selectedWords.has(draggingId)) {
							targetIds.clear();
							targetIds.add(draggingId);
						}
						if (innerX < rect.width / 2) {
							editLyricLines((state) => {
								const collectedWords = [];
								for (const line of state.lyricLines) {
									const words = line.words.filter((w) => targetIds.has(w.id));
									collectedWords.push(...words);
									line.words = line.words.filter((w) => !targetIds.has(w.id));
								}
								const targetLine = state.lyricLines.find(
									(l) => l.id === line.id,
								);
								if (!targetLine) return;
								const targetIndex = targetLine.words.findIndex(
									(w) => w.id === word.id,
								);
								if (targetIndex < 0) return;
								targetLine.words.splice(targetIndex, 0, ...collectedWords);
							});
						} else {
							editLyricLines((state) => {
								const collectedWords = [];
								for (const line of state.lyricLines) {
									const words = line.words.filter((w) => targetIds.has(w.id));
									collectedWords.push(...words);
									line.words = line.words.filter((w) => !targetIds.has(w.id));
								}
								const targetLine = state.lyricLines.find(
									(l) => l.id === line.id,
								);
								if (!targetLine) return;
								const targetIndex = targetLine.words.findIndex(
									(w) => w.id === word.id,
								);
								if (targetIndex < 0) return;
								targetLine.words.splice(targetIndex + 1, 0, ...collectedWords);
							});
						}
					}}
					onDragLeave={(evt) => {
						evt.currentTarget.classList.remove(styles.dropLeft);
						evt.currentTarget.classList.remove(styles.dropRight);
					}}
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
						} else if (evt.shiftKey) {
							setSelectedWords((v) => {
								const n = new Set(v);
								if (n.size > 0) {
									let minBoundry = Number.NaN;
									let maxBoundry = Number.NaN;
									line.words.forEach((word, i) => {
										if (n.has(word.id)) {
											if (Number.isNaN(minBoundry)) minBoundry = i;
											if (Number.isNaN(maxBoundry)) maxBoundry = i;

											minBoundry = Math.min(minBoundry, i, wordIndex);
											maxBoundry = Math.max(maxBoundry, i, wordIndex);
										}
									});
									for (let i = minBoundry; i <= maxBoundry; i++) {
										n.add(line.words[i].id);
									}
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
				</span>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item>拆分单词</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
};

const LyricWorldViewSync: FC<{
	wordAtom: Atom<LyricWord>;
	wordIndex: number;
	line: LyricLine;
	lineIndex: number;
}> = ({ wordAtom, line }) => {
	const word = useAtomValue(wordAtom);
	const [selectedWords, setSelectedWords] = useAtom(selectedWordsAtom);
	const setSelectedLines = useSetAtom(selectedLinesAtom);
	const visualizeTimestampUpdate = useAtomValue(visualizeTimestampUpdateAtom);
	const isWordBlank = useWordBlank(word.word);
	const displayWord = useDisplayWord(word.word, isWordBlank);

	const startTimeRef = useRef<HTMLDivElement>(null);
	const endTimeRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 用于呈现时间戳更新效果
	useEffect(() => {
		if (!visualizeTimestampUpdate) return;
		const animation = startTimeRef.current?.animate(
			[
				{
					backgroundColor: "var(--green-a8)",
				},
				{
					backgroundColor: "var(--green-a4)",
				},
			],
			{
				duration: 500,
			},
		);

		return () => {
			animation?.cancel();
		};
	}, [word.startTime, visualizeTimestampUpdate]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 用于呈现时间戳更新效果
	useEffect(() => {
		if (!visualizeTimestampUpdate) return;
		const animation = endTimeRef.current?.animate(
			[
				{
					backgroundColor: "var(--red-a8)",
				},
				{
					backgroundColor: "var(--red-a4)",
				},
			],
			{
				duration: 500,
			},
		);

		return () => {
			animation?.cancel();
		};
	}, [word.endTime, visualizeTimestampUpdate]);

	const className = useMemo(
		() =>
			classNames(
				styles.lyricWord,
				styles.sync,
				selectedWords.has(word.id) && styles.selected,
				isWordBlank && styles.blank,
			),
		[isWordBlank, selectedWords, word],
	);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className={className}
			onClick={(evt) => {
				evt.stopPropagation();
				evt.preventDefault();
				setSelectedLines(new Set([line.id]));
				setSelectedWords(new Set([word.id]));
			}}
		>
			<div className={classNames(styles.startTime)} ref={startTimeRef}>
				{msToTimestamp(word.startTime)}
			</div>
			<div className={styles.displayWord}>{displayWord}</div>
			<div className={classNames(styles.endTime)} ref={endTimeRef}>
				{msToTimestamp(word.endTime)}
			</div>
		</div>
	);
};

const useDisplayWord = (word: string, isWordBlank: boolean) =>
	useMemo(() => {
		if (word === "") return "空白";
		if (isWordBlank) return `空格 x${word.length}`;
		return word;
	}, [word, isWordBlank]);

export const LyricWordView: FC<{
	wordAtom: Atom<LyricWord>;
	wordIndex: number;
	line: LyricLine;
	lineIndex: number;
}> = ({ wordAtom, wordIndex, line, lineIndex }) => {
	const word = useAtomValue(wordAtom);
	const toolMode = useAtomValue(toolModeAtom);

	const isWordBlank = useWordBlank(word.word);

	return (
		<div>
			{toolMode === ToolMode.Edit && (
				<LyricWorldViewEdit
					wordAtom={wordAtom}
					line={line}
					lineIndex={lineIndex}
					wordIndex={wordIndex}
				/>
			)}
			{toolMode === ToolMode.Sync && !isWordBlank && (
				<LyricWorldViewSync
					wordAtom={wordAtom}
					line={line}
					lineIndex={lineIndex}
					wordIndex={wordIndex}
				/>
			)}
		</div>
	);
};

export default LyricWordView;
