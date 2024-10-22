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

import { Box, Flex, Text } from "@radix-ui/themes";
import { useAtomValue, useSetAtom } from "jotai";
import type { FC } from "react";
import { ViewportList } from "react-viewport-list";
import {
	currentLyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
} from "../../states";
import { LyricLineView } from "./lyric-line-view";
export const LyricLinesView: FC = () => {
	const editLyric = useAtomValue(currentLyricLinesAtom);
	const setSelectedLines = useSetAtom(selectedLinesAtom);
	const setSelectedWords = useSetAtom(selectedWordsAtom);

	if (editLyric.lyricLines.length === 0)
		return (
			<Flex
				flexGrow="1"
				gap="2"
				align="center"
				justify="center"
				direction="column"
			>
				<Text color="gray">没有歌词行</Text>
				<Text color="gray">
					在顶部面板中添加新歌词行或从菜单栏打开 / 导入已有歌词
				</Text>
			</Flex>
		);
	return (
		<Box
			flexGrow="1"
			style={{
				minHeight: "0",
				overflowX: "hidden",
				overflowY: "auto",
			}}
			onClick={(evt) => {
				setSelectedLines(new Set());
				setSelectedWords(new Set());
				evt.stopPropagation();
			}}
		>
			<ViewportList items={editLyric.lyricLines}>
				{(line, i) => (
					<LyricLineView
						key={`lyric-line-view-${i}`}
						line={line}
						lineIndex={i}
					/>
				)}
			</ViewportList>
		</Box>
	);
};

export default LyricLinesView;
