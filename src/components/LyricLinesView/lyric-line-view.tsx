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

import { Flex, IconButton, Text } from "@radix-ui/themes";
import Add16Filled from "@ricons/fluent/Add16Filled";
import { Icon } from "@ricons/utils";
import classNames from "classnames";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { type FC, useEffect, useRef } from "react";
import { uid } from "uid";
import {
	ToolMode,
	currentLyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	toolModeAtom,
} from "../../states";
import { msToTimestamp } from "../../utils/timestamp";
import type { LyricLine } from "../../utils/ttml-types";
import styles from "./index.module.css";
import { LyricWordView } from "./lyric-word-view";

export const LyricLineView: FC<{ line: LyricLine; lineIndex: number }> = ({
	line,
	lineIndex,
}) => {
	const [selectedLines, setSelectedLines] = useAtom(selectedLinesAtom);
	const [selectedWords, setSelectedWords] = useAtom(selectedWordsAtom);
	const editLyricLines = useSetAtom(currentLyricLinesAtom);
	const toolMode = useAtomValue(toolModeAtom);
	const store = useStore();
	const wordsContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const wordsContainerEl = wordsContainerRef.current;
		if (!wordsContainerEl) return;
		let scrollToIndex = Number.NaN;
		let i = 0;
		for (const word of line.words) {
			if (selectedWords.has(word.id)) {
				scrollToIndex = i;
				break;
			}

			i++;
		}
		if (Number.isNaN(scrollToIndex)) return;
		const wordEl = wordsContainerEl.children[scrollToIndex] as HTMLElement;
		if (!wordEl) return;
		wordsContainerEl.scrollTo({
			left: wordEl.offsetLeft - wordsContainerEl.clientWidth / 2,
			behavior: "instant",
		});
	}, [line.words, selectedWords]);

	return (
		<Flex
			mx="2"
			my="1"
			direction="row"
			className={classNames(
				styles.lyricLine,
				selectedLines.has(line.id) && styles.selected,
			)}
			align="center"
			gapX="4"
			onClick={(evt) => {
				evt.stopPropagation();
				evt.preventDefault();
				if (evt.ctrlKey) {
					setSelectedLines((v) => {
						const n = new Set(v);
						if (n.has(line.id)) {
							n.delete(line.id);
						} else {
							n.add(line.id);
						}
						return n;
					});
				} else if (evt.shiftKey) {
					setSelectedLines((v) => {
						const n = new Set(v);
						if (n.size > 0) {
							let minBoundry = Number.NaN;
							let maxBoundry = Number.NaN;
							const lyricLines = store.get(currentLyricLinesAtom).lyricLines;
							lyricLines.forEach((line, i) => {
								if (n.has(line.id)) {
									if (Number.isNaN(minBoundry)) minBoundry = i;
									if (Number.isNaN(maxBoundry)) maxBoundry = i;

									minBoundry = Math.min(minBoundry, i, lineIndex);
									maxBoundry = Math.max(maxBoundry, i, lineIndex);
								}
							});
							console.log(minBoundry, maxBoundry);
							for (let i = minBoundry; i <= maxBoundry; i++) {
								n.add(lyricLines[i].id);
							}
						} else {
							n.add(line.id);
						}
						return n;
					});
				} else {
					setSelectedLines(new Set([line.id]));
					setSelectedWords(new Set());
				}
			}}
			asChild
		>
			<div>
				<Text
					style={{
						minWidth: "2em",
					}}
					align="right"
					color="gray"
				>
					{lineIndex}
				</Text>
				<div
					className={classNames(
						styles.lyricWordsContainer,
						toolMode === ToolMode.Edit && styles.edit,
						toolMode === ToolMode.Sync && styles.sync,
					)}
					ref={wordsContainerRef}
				>
					{line.words.map((word, wi) => (
						<LyricWordView
							key={`lyric-line-${lineIndex}-word-${wi}`}
							word={word}
							wordIndex={wi}
							line={line}
							lineIndex={lineIndex}
						/>
					))}
				</div>
				{toolMode === ToolMode.Edit && (
					<Flex p="3">
						<IconButton
							variant="ghost"
							onClick={(evt) => {
								evt.preventDefault();
								evt.stopPropagation();
								const newWordId = uid();
								editLyricLines((state) => {
									state.lyricLines[lineIndex].words.push({
										id: newWordId,
										word: "",
										startTime: 0,
										endTime: 0,
										obscene: false,
										wordType: "normal",
										emptyBeat: 0,
									});
								});
								setSelectedWords(new Set([newWordId]));
							}}
						>
							<Icon>
								<Add16Filled
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								/>
							</Icon>
						</IconButton>
					</Flex>
				)}
				{toolMode === ToolMode.Sync && (
					<Flex pr="3" gap="1" direction="column" align="stretch">
						<div className={styles.startTime}>
							{msToTimestamp(line.startTime)}
						</div>
						<div className={styles.endTime}>{msToTimestamp(line.endTime)}</div>
					</Flex>
				)}
			</div>
		</Flex>
	);
};
