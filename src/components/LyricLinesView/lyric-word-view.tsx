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

import { currentTimeAtom } from "$/states/audio";
import { LayoutMode, layoutModeAtom } from "$/states/config.ts";
import { splitWordDialogAtom } from "$/states/dialogs.ts";
import {
	ToolMode,
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	splitWordStateAtom,
	toolModeAtom,
} from "$/states/main.ts";
import { visualizeTimestampUpdateAtom } from "$/states/sync.ts";
import { msToTimestamp, parseTimespan } from "$/utils/timestamp.ts";
import type { LyricLine, LyricWord } from "$/utils/ttml-types.ts";
import {
	CutRegular,
	DeleteRegular,
	PaddingLeftRegular,
	PaddingRightRegular,
	SplitVerticalRegular,
} from "@fluentui/react-icons";
import { ContextMenu, IconButton, TextField } from "@radix-ui/themes";
import classNames from "classnames";
import { type Atom, atom, useAtomValue, useSetAtom, useStore } from "jotai";
import { useSetImmerAtom } from "jotai-immer";
import {
	type FC,
	type PropsWithChildren,
	type SyntheticEvent,
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import styles from "./index.module.css";
import { LyricLineMenu } from "./lyric-line-menu.tsx";
import { LyricWordMenu } from "./lyric-word-menu";
import { useTranslation } from "react-i18next";

const isDraggingAtom = atom(false);
const draggingIdAtom = atom("");

const useWordBlank = (word: string) =>
	useMemo(
		() => word.length === 0 || (word.length > 0 && word.trim().length === 0),
		[word],
	);

type LyricWordViewEditProps = {
	wordAtom: Atom<LyricWord>;
	wordIndex: number;
	line: LyricLine;
	lineIndex: number;
};

const LyricWordViewEditSpan = ({
	wordAtom,
	wordIndex,
	line,
	lineIndex,
	className,
	children,
	onDoubleClick,
}: PropsWithChildren<
	LyricWordViewEditProps & {
		className?: string;
		onDoubleClick?: () => void;
	}
>) => {
	const word = useAtomValue(wordAtom);
	const store = useStore();
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const setSelectedLines = useSetImmerAtom(selectedLinesAtom);
	const isWordSelectedAtom = useMemo(
		() => atom((get) => get(selectedWordsAtom).has(get(wordAtom).id)),
		[wordAtom],
	);
	const isWordSelected = useAtomValue(isWordSelectedAtom);
	const setSelectedWords = useSetImmerAtom(selectedWordsAtom);
	const toolMode = useAtomValue(toolModeAtom);

	return (
		<ContextMenu.Root
			onOpenChange={(open) => {
				if (!open) return;
				if (isWordSelected) return;
				setSelectedWords((state) => {
					state.clear();
					state.add(word.id);
				});
				setSelectedLines((state) => {
					state.clear();
					state.add(line.id);
				});
			}}
		>
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
						if (isWordSelected) return;
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
						const targetIds = new Set(store.get(selectedWordsAtom));
						const draggingId = store.get(draggingIdAtom);
						if (!isWordSelected) {
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
					onDoubleClick={onDoubleClick}
					onClick={(evt) => {
						evt.stopPropagation();
						evt.preventDefault();
						if (evt.ctrlKey || evt.metaKey) {
							setSelectedWords((v) => {
								if (v.has(word.id)) {
									v.delete(word.id);
								} else {
									v.add(word.id);
								}
							});
						} else if (evt.shiftKey) {
							setSelectedWords((v) => {
								if (v.size > 0) {
									let minBoundry = Number.NaN;
									let maxBoundry = Number.NaN;
									line.words.forEach((word, i) => {
										if (v.has(word.id)) {
											if (Number.isNaN(minBoundry)) minBoundry = i;
											if (Number.isNaN(maxBoundry)) maxBoundry = i;

											minBoundry = Math.min(minBoundry, i, wordIndex);
											maxBoundry = Math.max(maxBoundry, i, wordIndex);
										}
									});
									for (let i = minBoundry; i <= maxBoundry; i++) {
										v.add(line.words[i].id);
									}
								} else {
									v.add(word.id);
								}
							});
						} else {
							setSelectedLines((state) => {
								if (!state.has(line.id) || state.size !== 1) {
									state.clear();
									state.add(line.id);
								}
							});
							setSelectedWords((state) => {
								if (!state.has(word.id) || state.size !== 1) {
									state.clear();
									state.add(word.id);
								}
							});
						}
					}}
				>
					{children}
				</span>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<LyricWordMenu
					wordAtom={wordAtom}
					wordIndex={wordIndex}
					lineIndex={lineIndex}
				/>
				<LyricLineMenu lineIndex={lineIndex} />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
};

function WordEditField<F extends keyof LyricWord, V extends LyricWord[F]>({
	wordAtom,
	fieldName,
	formatter,
	parser,
	textFieldStyle,
	children,
	...other
}: PropsWithChildren<
	{
		wordAtom: Atom<LyricWord>;
		fieldName: F;
		formatter: (v: V) => string;
		parser: (v: string) => V;
		textFieldStyle?: React.CSSProperties;
	} & TextField.RootProps
>) {
	const [fieldInput, setFieldInput] = useState<string | undefined>(undefined);
	const [fieldPlaceholder, setFieldPlaceholder] = useState<string>("");

	const editLyricLines = useSetImmerAtom(lyricLinesAtom);

	const currentValueAtom = useMemo(
		() =>
			atom((get) => {
				const word = get(wordAtom);
				return formatter(word[fieldName] as V);
			}),
		[fieldName, wordAtom, formatter],
	);
	const currentValue = useAtomValue(currentValueAtom);
	const store = useStore();

	const onInputFinished = useCallback(
		(rawValue: string) => {
			try {
				const thisWord = store.get(wordAtom);
				const value = parser(rawValue);
				editLyricLines((state) => {
					for (const line of state.lyricLines) {
						for (const word of line.words) {
							if (thisWord.id === word.id) {
								word[fieldName] = value;
								break;
							}
						}
					}
					return state;
				});
			} catch {
				if (typeof currentValue === "string") setFieldInput(currentValue);
			}
		},
		[wordAtom, store, editLyricLines, currentValue, fieldName, parser],
	);

	useLayoutEffect(() => {
		setFieldInput(currentValue);
		setFieldPlaceholder("");
	}, [currentValue]);

	return (
		<TextField.Root
			size="1"
			value={fieldInput ?? ""}
			placeholder={fieldPlaceholder}
			disabled={fieldInput === undefined}
			onChange={(evt) => setFieldInput(evt.currentTarget.value)}
			onKeyDown={(evt) => {
				if (evt.key !== "Enter") return;
				onInputFinished(evt.currentTarget.value);
			}}
			onBlur={(evt) => {
				if (evt.currentTarget.value === currentValue) return;
				onInputFinished(evt.currentTarget.value);
			}}
			{...other}
		>
			{children}
		</TextField.Root>
	);
}

const LyricWordViewEditAdvance = ({
	wordAtom,
	wordIndex,
	line,
	lineIndex,
}: LyricWordViewEditProps) => {
	const store = useStore();
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const setOpenSplitWordDialog = useSetAtom(splitWordDialogAtom);
	const setSplitState = useSetAtom(splitWordStateAtom);
	const word = useAtomValue(wordAtom);
	const isWordSelectedAtom = useMemo(
		() => atom((get) => get(selectedWordsAtom).has(get(wordAtom).id)),
		[wordAtom],
	);
	const isWordSelected = useAtomValue(isWordSelectedAtom);

	const isWordBlank = useWordBlank(word.word);

	const className = useMemo(
		() =>
			classNames(
				styles.lyricWord,
				styles.edit,
				styles.advance,
				isWordSelected && styles.selected,
				isWordBlank && styles.blank,
			),
		[isWordBlank, isWordSelected],
	);

	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger>
				<LyricWordViewEditSpan
					wordAtom={wordAtom}
					wordIndex={wordIndex}
					lineIndex={lineIndex}
					className={className}
					line={line}
				>
					<WordEditField
						size="1"
						color="green"
						wordAtom={wordAtom}
						fieldName="startTime"
						formatter={msToTimestamp}
						parser={parseTimespan}
						style={{
							minWidth: "0",
						}}
					>
						<TextField.Slot>
							<PaddingLeftRegular />
						</TextField.Slot>
					</WordEditField>
					<div className={styles.advanceBar}>
						<IconButton
							variant="soft"
							size="1"
							onClick={() => {
								setSplitState({
									wordIndex,
									lineIndex,
									word: word.word,
								});
								setOpenSplitWordDialog(true);
							}}
						>
							<CutRegular />
						</IconButton>
						<WordEditField
							size="1"
							wordAtom={wordAtom}
							fieldName="word"
							formatter={String}
							parser={String}
							style={{
								minWidth: "0em",
							}}
						/>
						<IconButton
							variant="soft"
							size="1"
							onClick={() => {
								editLyricLines((state) => {
									const selectedWords = store.get(selectedWordsAtom);
									for (const line of state.lyricLines) {
										line.words = line.words.filter(
											(w) => !selectedWords.has(w.id),
										);
									}
								});
							}}
						>
							<DeleteRegular />
						</IconButton>
					</div>
					<WordEditField
						size="1"
						color="red"
						wordAtom={wordAtom}
						fieldName="endTime"
						formatter={msToTimestamp}
						parser={parseTimespan}
						style={{
							minWidth: "0",
						}}
					>
						<TextField.Slot>
							<PaddingRightRegular />
						</TextField.Slot>
					</WordEditField>
					<WordEditField
						size="1"
						type="number"
						min={0}
						wordAtom={wordAtom}
						fieldName="emptyBeat"
						formatter={String}
						parser={Number.parseInt}
						style={{
							minWidth: "0",
						}}
					>
						<TextField.Slot>
							<SplitVerticalRegular />
						</TextField.Slot>
					</WordEditField>
				</LyricWordViewEditSpan>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<LyricWordMenu
					wordAtom={wordAtom}
					wordIndex={wordIndex}
					lineIndex={lineIndex}
				/>
				<LyricLineMenu lineIndex={lineIndex} />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
};

const LyricWorldViewEdit = ({
	wordAtom,
	wordIndex,
	line,
	lineIndex,
}: LyricWordViewEditProps) => {
	const word = useAtomValue(wordAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const setSelectedLines = useSetImmerAtom(selectedLinesAtom);
	const isWordSelectedAtom = useMemo(
		() => atom((get) => get(selectedWordsAtom).has(get(wordAtom).id)),
		[wordAtom],
	);
	const isWordSelected = useAtomValue(isWordSelectedAtom);
	const setSelectedWords = useSetImmerAtom(selectedWordsAtom);
	const [editing, setEditing] = useState(false);

	const isWordBlank = useWordBlank(word.word);
	const displayWord = useDisplayWord(word.word, isWordBlank);

	const className = useMemo(
		() =>
			classNames(
				styles.lyricWord,
				styles.edit,
				isWordSelected && styles.selected,
				isWordBlank && styles.blank,
			),
		[isWordBlank, isWordSelected],
	);

	const onEnter = useCallback(
		(evt: SyntheticEvent<HTMLInputElement>) => {
			setEditing(false);
			const newWord = evt.currentTarget.value;
			if (newWord !== word.word) {
				editLyricLines((state) => {
					state.lyricLines[lineIndex].words[wordIndex].word = newWord;
				});
			}
		},
		[editLyricLines, lineIndex, word.word, wordIndex],
	);

	return editing ? (
		<TextField.Root
			autoFocus
			defaultValue={word.word}
			onBlur={onEnter}
			onKeyDown={(evt) => {
				if (evt.key === "Enter") onEnter(evt);
			}}
		/>
	) : (
		<ContextMenu.Root
			onOpenChange={(open) => {
				if (!open) return;
				if (isWordSelected) return;
				setSelectedWords((state) => {
					state.clear();
					state.add(word.id);
				});
				setSelectedLines((state) => {
					state.clear();
					state.add(line.id);
				});
			}}
		>
			<ContextMenu.Trigger>
				<LyricWordViewEditSpan
					wordAtom={wordAtom}
					wordIndex={wordIndex}
					lineIndex={lineIndex}
					className={className}
					line={line}
					onDoubleClick={() => {
						setEditing(true);
					}}
				>
					{displayWord}
				</LyricWordViewEditSpan>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<LyricWordMenu
					wordAtom={wordAtom}
					wordIndex={wordIndex}
					lineIndex={lineIndex}
				/>
				<LyricLineMenu lineIndex={lineIndex} />
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
	const isWordSelectedAtom = useMemo(
		() => atom((get) => get(selectedWordsAtom).has(get(wordAtom).id)),
		[wordAtom],
	);
	const isWordActiveAtom = useMemo(
		() =>
			atom((get) => {
				const currentTime = get(currentTimeAtom);
				const word = get(wordAtom);
				return currentTime >= word.startTime && currentTime < word.endTime;
			}),
		[wordAtom],
	);
	const isWordActive = useAtomValue(isWordActiveAtom);
	const isWordSelected = useAtomValue(isWordSelectedAtom);
	const setSelectedWords = useSetImmerAtom(selectedWordsAtom);
	const setSelectedLines = useSetImmerAtom(selectedLinesAtom);
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
				isWordSelected && styles.selected,
				isWordBlank && styles.blank,
				isWordActive && styles.active,
			),
		[isWordBlank, isWordSelected, isWordActive],
	);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className={className}
			onClick={(evt) => {
				evt.stopPropagation();
				evt.preventDefault();
				setSelectedLines((state) => {
					state.clear();
					state.add(line.id);
				});
				setSelectedWords((state) => {
					state.clear();
					state.add(word.id);
				});
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

const useDisplayWord = (word: string, isWordBlank: boolean) => {
	const { t } = useTranslation();
	return useMemo(() => {
		if (word === "") return t("lyricWordView.empty", "空白");
		if (isWordBlank) return t("lyricWordView.spaceCount", "空格 x{{count}}", { count: word.length });
		return word;
	}, [word, isWordBlank, t]);
};

export const LyricWordView: FC<{
	wordAtom: Atom<LyricWord>;
	wordIndex: number;
	line: LyricLine;
	lineIndex: number;
}> = memo(({ wordAtom, wordIndex, line, lineIndex }) => {
	const word = useAtomValue(wordAtom);
	const toolMode = useAtomValue(toolModeAtom);
	const layoutMode = useAtomValue(layoutModeAtom);

	const isWordBlank = useWordBlank(word.word);

	return (
		<div>
			{toolMode === ToolMode.Edit && layoutMode === LayoutMode.Simple && (
				<LyricWorldViewEdit
					wordAtom={wordAtom}
					line={line}
					lineIndex={lineIndex}
					wordIndex={wordIndex}
				/>
			)}
			{toolMode === ToolMode.Edit && layoutMode === LayoutMode.Advance && (
				<LyricWordViewEditAdvance
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
});

export default LyricWordView;
