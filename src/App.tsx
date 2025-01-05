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

import { Box, Button, Flex, Text, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import SuspensePlaceHolder from "$/components/SuspensePlaceHolder";
import { TouchSyncPanel } from "$/components/TouchSyncPanel";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useStore } from "jotai";
import { Suspense, lazy, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import styles from "./App.module.css";
import AudioControls from "./components/AudioControls";
import DarkThemeDetector from "./components/DarkThemeDetector";
import { SyncKeyBinding } from "./components/LyricLinesView/sync-keybinding.tsx";
import RibbonBar from "./components/RibbonBar";
import { TitleBar } from "./components/TitleBar";
import {
	ToolMode,
	isDarkThemeAtom,
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	toolModeAtom,
} from "./states/main.ts";
import { showTouchSyncPanelAtom } from "./states/sync.ts";
import { isInteracting } from "./utils/keybindings.ts";

const LyricLinesView = lazy(() => import("./components/LyricLinesView"));
const AMLLWrapper = lazy(() => import("./components/AMLLWrapper"));
const Dialogs = lazy(() => import("./components/Dialogs"));

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

	useEffect(() => {
		toast.warn("本重构版本仍在开发当中，敬请保存备份你的项目以免发生意外！");
	}, []);

	useEffect(() => {
		const onBeforeClose = (evt: BeforeUnloadEvent) => {
			const currentLyricLines = store.get(lyricLinesAtom);
			if (
				currentLyricLines.lyricLines.length +
					currentLyricLines.metadata.length >
				0
			) {
				evt.preventDefault();
				evt.returnValue = false;
			}
		};
		window.addEventListener("beforeunload", onBeforeClose);
		return () => {
			window.removeEventListener("beforeunload", onBeforeClose);
		};
	}, [store]);

	return (
		<Theme
			appearance={isDarkTheme ? "dark" : "light"}
			panelBackground="solid"
			hasBackground={!import.meta.env.TAURI_ENV_PLATFORM}
			accentColor={isDarkTheme ? "jade" : "green"}
			className={styles.radixTheme}
			onClick={(evt) => {
				if (isInteracting(evt.nativeEvent)) return;
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
					<AnimatePresence mode="wait">
						{toolMode !== ToolMode.Preview && (
							<SuspensePlaceHolder key="edit">
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
								>
									<LyricLinesView key="edit" />
								</motion.div>
							</SuspensePlaceHolder>
						)}
						{toolMode === ToolMode.Preview && (
							<SuspensePlaceHolder key="amll-preview">
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
							</SuspensePlaceHolder>
						)}
					</AnimatePresence>
				</Box>
				{showTouchSyncPanel && toolMode === ToolMode.Sync && <TouchSyncPanel />}
				<Box flexShrink="0">
					<AudioControls />
				</Box>
			</Flex>
			<Suspense fallback={null}>
				<Dialogs />
			</Suspense>
			<ToastContainer theme={isDarkTheme ? "dark" : "light"} />
		</Theme>
	);
}

export default App;
