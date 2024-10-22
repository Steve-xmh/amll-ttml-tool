/*
 * Copyright 2023-2024 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { Box, Flex, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import AudioControls from "./components/AudioControls";
import DarkThemeDetector from "./components/DarkThemeDetector";
import LyricLinesView from "./components/LyricLinesView";
import RibbonBar from "./components/RibbonBar";
import { TitleBar } from "./components/TitleBar";
import { ToolMode, isDarkThemeAtom, toolModeAtom } from "./states";

function App() {
	const isDarkTheme = useAtomValue(isDarkThemeAtom);
	const toolMode = useAtomValue(toolModeAtom);
	if (import.meta.env.TAURI_ENV_PLATFORM) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			const win = getCurrentWindow();
			win.show();
		}, []);
	}

	return (
		<Theme
			appearance={isDarkTheme ? "dark" : "light"}
			panelBackground="solid"
			hasBackground={!import.meta.env.TAURI_ENV_PLATFORM}
			accentColor={isDarkTheme ? "jade" : "green"}
			style={{
				"--color-panel": "var(--gray-a2)",
			}}
		>
			<DarkThemeDetector />
			<Flex direction="column" height="100vh">
				<TitleBar />
				<RibbonBar />
				<AnimatePresence>
					{toolMode === ToolMode.Edit && <LyricLinesView key="edit" />}
					{toolMode !== ToolMode.Edit && <Box flexGrow="1" key="not-edit" />}
				</AnimatePresence>
				<Box flexShrink="1">
					<AudioControls />
				</Box>
			</Flex>
		</Theme>
	);
}

export default App;
