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
	toolModeAtom,
} from "$/states/main.ts";
import { Box, Flex, Text } from "@radix-ui/themes";
import { atom, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { splitAtom } from "jotai/utils";
import {
	type FC,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { ViewportList, type ViewportListRef } from "react-viewport-list";
import { LyricLineView } from "./lyric-line-view";

const lyricLinesOnlyAtom = splitAtom(
	focusAtom(lyricLinesAtom, (o) => o.prop("lyricLines")),
);

export const LyricLinesView: FC = forwardRef<HTMLDivElement>((_props, ref) => {
	const editLyric = useAtomValue(lyricLinesOnlyAtom);
	const viewRef = useRef<ViewportListRef>(null);
	const viewElRef = useRef<HTMLDivElement>(null);
	const toolMode = useAtomValue(toolModeAtom);

	const scrollToIndexAtom = useMemo(
		() =>
			atom((get) => {
				if (toolMode !== ToolMode.Sync) return;
				const viewEl = viewElRef.current;
				if (!viewEl) return;
				const viewContainerEl = viewEl.parentElement;
				if (!viewContainerEl) return;
				const selectedLines = get(selectedLinesAtom);
				let scrollToIndex = Number.NaN;
				let i = 0;
				for (const lineAtom of editLyric) {
					const line = get(lineAtom);
					if (selectedLines.has(line.id)) {
						scrollToIndex = i;
						break;
					}

					i++;
				}
				if (Number.isNaN(scrollToIndex)) return;
				return scrollToIndex;
			}),
		[editLyric, toolMode],
	);
	const scrollToIndex = useAtomValue(scrollToIndexAtom);

	useEffect(() => {
		if (scrollToIndex === undefined) return;
		const viewEl = viewElRef.current;
		if (!viewEl) return;
		const viewContainerEl = viewEl.parentElement;
		if (!viewContainerEl) return;
		viewRef.current?.scrollToIndex({
			index: scrollToIndex,
			offset: viewContainerEl.clientHeight / -2 + 50,
		});
	}, [scrollToIndex]);

	useImperativeHandle(ref, () => viewElRef.current as HTMLDivElement, []);

	if (editLyric.length === 0)
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
			ref={viewElRef}
		>
			<ViewportList
				overscan={10}
				items={editLyric}
				ref={viewRef}
				viewportRef={viewElRef}
			>
				{(lineAtom, i) => (
					<LyricLineView
						key={`${lineAtom}`}
						lineAtom={lineAtom}
						lineIndex={i}
					/>
				)}
			</ViewportList>
		</Box>
	);
});

export default LyricLinesView;
