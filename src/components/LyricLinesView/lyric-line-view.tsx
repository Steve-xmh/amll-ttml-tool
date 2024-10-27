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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { FC } from "react";
import { uid } from "uid";
import {
	currentLyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	ToolMode,
	toolModeAtom,
} from "../../states";
import type { LyricLine } from "../../utils/ttml-types";
import styles from "./index.module.css";
import { LyricWordView } from "./lyric-word-view";
import { motion } from "framer-motion";
import { msToTimestamp } from "../../utils/timestamp";

export const LyricLineView: FC<{ line: LyricLine; lineIndex: number }> = ({
	line,
	lineIndex,
}) => {
	const [selectedLines, setSelectedLines] = useAtom(selectedLinesAtom);
	const setSelectedWords = useSetAtom(selectedWordsAtom);
	const editLyricLines = useSetAtom(currentLyricLinesAtom);
	const toolMode = useAtomValue(toolModeAtom);

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
				} else {
					setSelectedLines(new Set([line.id]));
					setSelectedWords(new Set());
				}
			}}
			asChild
		>
			<motion.div layout="size" layoutId={`lyric-line-view-index-${lineIndex}`}>
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
				>
					{line.words.map((word, wi) => (
						<LyricWordView
							key={`lyric-line-word-${wi}`}
							word={word}
							wordIndex={wi}
							line={line}
							lineIndex={lineIndex}
						/>
					))}
				</div>
				{toolMode === ToolMode.Edit && <IconButton
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
				</IconButton>}
				{
					toolMode === ToolMode.Sync && <Flex pr="3" gap="1" direction="column" align="stretch">
					<div className={styles.startTime}>{msToTimestamp(line.startTime)}</div>
					<div className={styles.endTime}>{msToTimestamp(line.endTime)}</div>
					</Flex>
				}
			</motion.div>
		</Flex>
	);
};
