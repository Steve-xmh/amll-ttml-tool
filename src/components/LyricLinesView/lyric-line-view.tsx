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

import { draggingIdAtom } from "$/components/LyricLinesView/lyric-line-view-states.ts";
import {
	ToolMode,
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	toolModeAtom,
} from "$/states/main.ts";
import { visualizeTimestampUpdateAtom } from "$/states/sync.ts";
import { msToTimestamp } from "$/utils/timestamp.ts";
import {
	type LyricLine,
	newLyricLine,
	newLyricWord,
} from "$/utils/ttml-types.ts";
import {
	AddFilled,
	TextAlignRightFilled,
	VideoBackgroundEffectFilled,
} from "@fluentui/react-icons";
import {
	Button,
	ContextMenu,
	Flex,
	IconButton,
	Text,
	TextField,
} from "@radix-ui/themes";
import classNames from "classnames";
import { type Atom, atom, useAtomValue, useStore } from "jotai";
import { useSetImmerAtom } from "jotai-immer";
import { splitAtom } from "jotai/utils";
import {
	type FC,
	Fragment,
	type RefObject,
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
import { LyricWordView } from "./lyric-word-view";

const isDraggingAtom = atom(false);

const LyricLineScroller = ({
	lineAtom,
	wordsContainer,
}: {
	lineAtom: Atom<LyricLine>;
	wordsContainer: HTMLDivElement | null;
}) => {
	const scrollToIndexAtom = useMemo(() =>
		atom((get) => {
			const line = get(lineAtom);
			const selectedWords = get(selectedWordsAtom);
			if (selectedWords.size === 0) return Number.NaN;
			let scrollToIndex = Number.NaN;
			let i = 0;
			for (const word of line.words) {
				if (selectedWords.has(word.id)) {
					scrollToIndex = i;
					break;
				}
				i++;
			}
			return scrollToIndex;
		})
		, [lineAtom]);
	const scrollToIndex = useAtomValue(scrollToIndexAtom);

	useEffect(() => {
		if (Number.isNaN(scrollToIndex)) return;
		console.log({ scrollToIndex, wordsContainer });
		if (!wordsContainer) return;
		const wordEl = wordsContainer.children[scrollToIndex] as HTMLElement;
		console.log({ wordEl, wordsContainer });
		if (!wordEl) return;
		wordsContainer.scrollTo({
			left: wordEl.offsetLeft - wordsContainer.clientWidth / 2,
			behavior: "auto",
		});
	}, [scrollToIndex, wordsContainer]);

	return null;
};

const SubLineEdit = memo(
	({
		lineAtom,
		lineIndex,
		type,
	}: {
		lineAtom: Atom<LyricLine>;
		lineIndex: number;
		type: "translatedLyric" | "romanLyric";
	}) => {
		const editLyricLines = useSetImmerAtom(lyricLinesAtom);
		const line = useAtomValue(lineAtom);
		const [editing, setEditing] = useState(false);

		const onEnter = useCallback(
			(evt: SyntheticEvent<HTMLInputElement>) => {
				setEditing(false);
				const newValue = evt.currentTarget.value;
				if (newValue !== line[type]) {
					editLyricLines((state) => {
						state.lyricLines[lineIndex][type] = newValue;
					});
				}
			},
			[editLyricLines, line, lineIndex, type],
		);

		const label = useMemo(
			() => (type === "translatedLyric" ? "翻译：" : "音译："),
			[type],
		);

		return (
			<Flex align="baseline">
				<Text size="2">{label}</Text>
				{editing ? (
					<TextField.Root
						autoFocus
						size="1"
						defaultValue={line[type]}
						onBlur={onEnter}
						onKeyDown={(evt) => {
							if (evt.key === "Enter") onEnter(evt);
						}}
					/>
				) : (
					<Button
						size="2"
						color="gray"
						variant="ghost"
						onClick={(evt) => {
							evt.stopPropagation();
							setEditing(true);
						}}
					>
						{line[type] || <Text color="gray">无</Text>}
					</Button>
				)}
			</Flex>
		);
	},
);

export const LyricLineView: FC<{
	lineAtom: Atom<LyricLine>;
	lineIndex: number;
}> = memo(({ lineAtom, lineIndex }) => {
	const line = useAtomValue(lineAtom);
	const setSelectedLines = useSetImmerAtom(selectedLinesAtom);
	const lineSelectedAtom = useMemo(() => {
		const a = atom((get) => get(selectedLinesAtom).has(line.id));
		if (import.meta.env.DEV) {
			a.debugLabel = `lineSelectedAtom-${line.id}`;
		}
		return a;
	}, [line.id]);
	const wordsAtom = useMemo(
		() => splitAtom(atom((get) => get(lineAtom).words)),
		[lineAtom],
	);
	const words = useAtomValue(wordsAtom);
	const lineSelected = useAtomValue(lineSelectedAtom);
	const setSelectedWords = useSetImmerAtom(selectedWordsAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const visualizeTimestampUpdate = useAtomValue(visualizeTimestampUpdateAtom);
	const toolMode = useAtomValue(toolModeAtom);
	const store = useStore();
	const wordsContainerRef = useRef<HTMLDivElement>(null);

	const startTimeRef = useRef<HTMLDivElement>(null);
	const endTimeRef = useRef<HTMLDivElement>(null);
	const [enableInsert, setEnableInsert] = useState(false);

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
	}, [line.startTime, visualizeTimestampUpdate]);

	useLayoutEffect(() => {
		if (toolMode !== ToolMode.Edit) {
			setEnableInsert(false);
		}
	}, [toolMode]);

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
	}, [line.endTime, visualizeTimestampUpdate]);

	return (
		<>
			<LyricLineScroller
				lineAtom={lineAtom}
				wordsContainer={wordsContainerRef.current}
			/>
			{enableInsert && (
				<Button
					mx="2"
					my="1"
					variant="soft"
					size="1"
					style={{
						width: "calc(100% - var(--space-4))",
					}}
					onClick={() => {
						editLyricLines((state) => {
							state.lyricLines.splice(lineIndex, 0, newLyricLine());
						});
						// setInsertMode(InsertMode.None);
						setEnableInsert(false);
					}}
				>
					在此插入新行
				</Button>
			)}
			<ContextMenu.Root
				onOpenChange={(opened) => {
					if (opened) {
						if (!store.get(selectedLinesAtom).has(line.id)) {
							store.set(selectedLinesAtom, new Set([line.id]));
						}
					}
				}}
			>
				<ContextMenu.Trigger disabled={toolMode !== ToolMode.Edit}>
					<Flex
						mx="2"
						my="1"
						direction="row"
						className={classNames(
							styles.lyricLine,
							lineSelected && styles.selected,
							toolMode === ToolMode.Sync && styles.sync,
							toolMode === ToolMode.Edit && styles.edit,
							line.ignoreSync && styles.ignoreSync,
						)}
						align="center"
						gapX="4"
						draggable={toolMode === ToolMode.Edit}
						onDragStart={(evt) => {
							evt.dataTransfer.dropEffect = "move";
							store.set(isDraggingAtom, true);
							store.set(draggingIdAtom, line.id);
						}}
						onDragEnd={() => {
							store.set(isDraggingAtom, false);
						}}
						onDragOver={(evt) => {
							if (!store.get(isDraggingAtom)) return;
							if (store.get(draggingIdAtom) === line.id) return;
							if (lineSelected) return;
							evt.preventDefault();
							evt.dataTransfer.dropEffect = "move";
							const rect = evt.currentTarget.getBoundingClientRect();
							const innerY = evt.clientY - rect.top;
							if (innerY < rect.height / 2) {
								evt.currentTarget.classList.add(styles.dropTop);
								evt.currentTarget.classList.remove(styles.dropBottom);
							} else {
								evt.currentTarget.classList.remove(styles.dropTop);
								evt.currentTarget.classList.add(styles.dropBottom);
							}
						}}
						onDrop={(evt) => {
							evt.currentTarget.classList.remove(styles.dropTop);
							evt.currentTarget.classList.remove(styles.dropBottom);
							if (!store.get(isDraggingAtom)) return;
							const rect = evt.currentTarget.getBoundingClientRect();
							const innerY = evt.clientY - rect.top;
							const selectedLines = store.get(selectedLinesAtom);
							const selectedLineIds = selectedLines.has(
								store.get(draggingIdAtom),
							)
								? selectedLines
								: new Set([store.get(draggingIdAtom)]);
							if (innerY < rect.height / 2) {
								editLyricLines((state) => {
									const filteredLines = state.lyricLines.filter(
										(l) => !selectedLineIds.has(l.id),
									);
									const targetLines = state.lyricLines.filter((l) =>
										selectedLineIds.has(l.id),
									);
									const targetIndex = filteredLines.findIndex(
										(l) => l.id === line.id,
									);
									if (targetIndex < 0) return;
									state.lyricLines = [
										...filteredLines.slice(0, targetIndex),
										...targetLines,
										...filteredLines.slice(targetIndex),
									];
								});
							} else {
								editLyricLines((state) => {
									const filteredLines = state.lyricLines.filter(
										(l) => !selectedLineIds.has(l.id),
									);
									const targetLines = state.lyricLines.filter((l) =>
										selectedLineIds.has(l.id),
									);
									const targetIndex = filteredLines.findIndex(
										(l) => l.id === line.id,
									);
									if (targetIndex < 0) return;
									state.lyricLines = [
										...filteredLines.slice(0, targetIndex + 1),
										...targetLines,
										...filteredLines.slice(targetIndex + 2),
									];
								});
							}
						}}
						onDragLeave={(evt) => {
							evt.currentTarget.classList.remove(styles.dropTop);
							evt.currentTarget.classList.remove(styles.dropBottom);
						}}
						onClick={(evt) => {
							evt.stopPropagation();
							evt.preventDefault();
							if (evt.ctrlKey) {
								setSelectedLines((v) => {
									if (v.has(line.id)) {
										v.delete(line.id);
									} else {
										v.add(line.id);
									}
								});
							} else if (evt.shiftKey) {
								setSelectedLines((v) => {
									if (v.size > 0) {
										let minBoundry = Number.NaN;
										let maxBoundry = Number.NaN;
										const lyricLines = store.get(lyricLinesAtom).lyricLines;
										lyricLines.forEach((line, i) => {
											if (v.has(line.id)) {
												if (Number.isNaN(minBoundry)) minBoundry = i;
												if (Number.isNaN(maxBoundry)) maxBoundry = i;

												minBoundry = Math.min(minBoundry, i, lineIndex);
												maxBoundry = Math.max(maxBoundry, i, lineIndex);
											}
										});
										for (let i = minBoundry; i <= maxBoundry; i++) {
											v.add(lyricLines[i].id);
										}
									} else {
										v.add(line.id);
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
									if (state.size !== 0) {
										state.clear();
									}
								});
							}
						}}
						asChild
					>
						<div>
							<Flex direction="column" align="center" justify="center" ml="3">
								<Text
									style={{
										minWidth: "2em",
									}}
									align="center"
									color="gray"
								>
									{lineIndex}
								</Text>
								{line.isBG && <VideoBackgroundEffectFilled color="#4466FF" />}
								{line.isDuet && <TextAlignRightFilled color="#44AA33" />}
							</Flex>
							<div
								className={classNames(
									styles.lyricLineContainer,
									toolMode === ToolMode.Edit && styles.edit,
									toolMode === ToolMode.Sync && styles.sync,
								)}
							>
								<div
									className={classNames(
										styles.lyricWordsContainer,
										toolMode === ToolMode.Edit && styles.edit,
										toolMode === ToolMode.Sync && styles.sync,
									)}
									ref={wordsContainerRef}
								>
									{words.map((wordAtom, wi) => (
										<Fragment key={`word-${wi}`}>
											{enableInsert && (
												<IconButton
													size="1"
													variant="soft"
													onClick={(evt) => {
														evt.preventDefault();
														evt.stopPropagation();
														editLyricLines((state) => {
															state.lyricLines[lineIndex].words.splice(
																wi,
																0,
																newLyricWord(),
															);
														});
													}}
												>
													<AddFilled />
												</IconButton>
											)}
											<LyricWordView
												wordAtom={wordAtom}
												wordIndex={wi}
												line={line}
												lineIndex={lineIndex}
											/>
										</Fragment>
									))}
									{enableInsert && (
										<IconButton
											size="1"
											variant="soft"
											onClick={(evt) => {
												evt.preventDefault();
												evt.stopPropagation();
												editLyricLines((state) => {
													state.lyricLines[lineIndex].words.push(
														newLyricWord(),
													);
												});
											}}
										>
											<AddFilled />
										</IconButton>
									)}
									{toolMode === ToolMode.Edit && (
										<TextField.Root
											placeholder="插入单词…"
											className={classNames(
												styles.insertWordField,
												words.length === 0 && styles.empty,
											)}
											style={{
												alignSelf: "center",
											}}
											onKeyDown={(evt) => {
												if (evt.key === "Enter") {
													evt.preventDefault();
													evt.stopPropagation();
													editLyricLines((state) => {
														state.lyricLines[lineIndex].words.push({
															...newLyricWord(),
															word: evt.currentTarget.value,
														});
													});
													evt.currentTarget.value = "";
												}
											}}
										/>
									)}
								</div>
								{toolMode === ToolMode.Edit && (
									<>
										<SubLineEdit
											lineAtom={lineAtom}
											lineIndex={lineIndex}
											type="translatedLyric"
										/>
										<SubLineEdit
											lineAtom={lineAtom}
											lineIndex={lineIndex}
											type="romanLyric"
										/>
									</>
								)}
							</div>
							{toolMode === ToolMode.Edit && (
								<Flex p="3">
									<IconButton
										size="1"
										variant={enableInsert ? "solid" : "soft"}
										onClick={(evt) => {
											evt.preventDefault();
											evt.stopPropagation();
											setEnableInsert((v) => !v);
										}}
									>
										<AddFilled />
									</IconButton>
								</Flex>
							)}
							{toolMode === ToolMode.Sync && (
								<Flex pr="3" gap="1" direction="column" align="stretch">
									<div className={styles.startTime} ref={startTimeRef}>
										{msToTimestamp(line.startTime)}
									</div>
									<div className={styles.endTime} ref={endTimeRef}>
										{msToTimestamp(line.endTime)}
									</div>
								</Flex>
							)}
						</div>
					</Flex>
				</ContextMenu.Trigger>
				<ContextMenu.Content>
					<LyricLineMenu lineIndex={lineIndex} />
				</ContextMenu.Content>
			</ContextMenu.Root>
			{enableInsert && (
				<Button
					mx="2"
					my="1"
					variant="soft"
					size="1"
					style={{
						width: "calc(100% - var(--space-4))",
					}}
					onClick={() => {
						editLyricLines((state) => {
							state.lyricLines.splice(lineIndex + 1, 0, newLyricLine());
						});
						// setInsertMode(InsertMode.None);
						setEnableInsert(false);
					}}
				>
					在此插入新行
				</Button>
			)}
		</>
	);
});
