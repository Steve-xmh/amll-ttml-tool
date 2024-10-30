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

import { Box, Button, Card, Flex, Grid, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useStore } from "jotai";
import { useEffect } from "react";
import { AMLLWrapper } from "./components/AMLLWrapper/index.tsx";
import AudioControls from "./components/AudioControls";
import DarkThemeDetector from "./components/DarkThemeDetector";
import LyricLinesView from "./components/LyricLinesView";
import { SyncKeyBinding } from "./components/LyricLinesView/sync-keybinding.tsx";
import RibbonBar from "./components/RibbonBar";
import { TitleBar } from "./components/TitleBar";
import {
	ToolMode,
	isDarkThemeAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	toolModeAtom,
} from "./states/main.ts";
import { showTouchSyncPanelAtom } from "./states/sync.ts";

function App() {
	const isDarkTheme = useAtomValue(isDarkThemeAtom);
	const toolMode = useAtomValue(toolModeAtom);
	const showTouchSyncPanel = useAtomValue(showTouchSyncPanelAtom);
	const store = useStore();
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
			onClickCapture={() => {
				store.set(selectedLinesAtom, new Set());
				store.set(selectedWordsAtom, new Set());
			}}
		>
			{toolMode === ToolMode.Sync && <SyncKeyBinding />}
			<DarkThemeDetector />
			<Flex direction="column" height="100vh">
				<TitleBar />
				<RibbonBar />
				<Box flexGrow="1" overflow="hidden">
					<AnimatePresence mode="popLayout">
						{toolMode !== ToolMode.Preview && (
							<motion.div
								layout="position"
								style={{
									height: "100%",
									maxHeight: "100%",
									overflowY: "hidden",
								}}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								key="edit"
							>
								<LyricLinesView key="edit" />
							</motion.div>
						)}
						{toolMode === ToolMode.Preview && (
							<Box height="100%" key="amll-preview" p="2" asChild>
								<motion.div
									layout="position"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									<AMLLWrapper />
								</motion.div>
							</Box>
						)}
					</AnimatePresence>
				</Box>
				{showTouchSyncPanel && (
					<Card m="2" mt="0" style={{ flexShrink: "0" }}>
						<Grid rows="2" columns="3" gap="2">
							<Button variant="soft" size="4">
								跳上词
							</Button>
							<Button variant="soft" size="4">
								跳本词
							</Button>
							<Button variant="soft" size="4">
								跳下词
							</Button>
							<Button variant="soft" size="4">
								起始轴
							</Button>
							<Button variant="soft" size="4">
								连续轴
							</Button>
							<Button variant="soft" size="4">
								结束轴
							</Button>
						</Grid>
					</Card>
				)}
				<Box flexShrink="0">
					<AudioControls />
				</Box>
			</Flex>
		</Theme>
	);
}

export default App;