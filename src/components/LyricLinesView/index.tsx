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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	type FC,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";
import { ViewportList, type ViewportListRef } from "react-viewport-list";
import {
	ToolMode,
	currentLyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	toolModeAtom,
} from "../../states/main";
import { LyricLineView } from "./lyric-line-view";
export const LyricLinesView: FC = forwardRef<HTMLDivElement>((_props, ref) => {
	const editLyric = useAtomValue(currentLyricLinesAtom);
	const [selectedLines, setSelectedLines] = useAtom(selectedLinesAtom);
	const setSelectedWords = useSetAtom(selectedWordsAtom);
	const viewRef = useRef<ViewportListRef>(null);
	const viewElRef = useRef<HTMLDivElement>(null);
	const toolMode = useAtomValue(toolModeAtom);

	useEffect(() => {
		if (toolMode !== ToolMode.Sync) return;
		const viewEl = viewElRef.current;
		if (!viewEl) return;
		const viewContainerEl = viewEl.parentElement;
		if (!viewContainerEl) return;
		let scrollToIndex = Number.NaN;
		let i = 0;
		for (const line of editLyric.lyricLines) {
			if (selectedLines.has(line.id)) {
				scrollToIndex = i;
				break;
			}

			i++;
		}
		if (Number.isNaN(scrollToIndex)) return;
		viewRef.current?.scrollToIndex({
			index: scrollToIndex,
			offset: viewContainerEl.clientHeight / -2 + 50,
		});
	}, [editLyric.lyricLines, selectedLines, toolMode]);

	useImperativeHandle(ref, () => viewElRef.current as HTMLDivElement, []);

	if (editLyric.lyricLines.length === 0)
		return (
			<Flex
				flexGrow="1"
				gap="2"
				align="center"
				justify="center"
				direction="column"
				height="100%"
				ref={ref}
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
				padding: toolMode === ToolMode.Sync ? "20vh 0" : undefined,
				maxHeight: "100%",
				overflowY: "auto",
			}}
			onClick={(evt) => {
				setSelectedLines(new Set());
				setSelectedWords(new Set());
				evt.stopPropagation();
			}}
			ref={viewElRef}
		>
			<ViewportList
				overscan={10}
				items={editLyric.lyricLines}
				ref={viewRef}
				viewportRef={viewElRef}
			>
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
});

export default LyricLinesView;
