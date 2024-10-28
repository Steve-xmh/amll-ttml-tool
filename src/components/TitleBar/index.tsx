import {
	Box,
	Button,
	DropdownMenu,
	Flex,
	SegmentedControl,
	Text,
} from "@radix-ui/themes";
import classNames from "classnames";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import type { FC } from "react";
import { Trans } from "react-i18next";
import saveFile from "save-file";
import { WindowControls, type WindowControlsProps } from "tauri-controls";
import {
	ToolMode,
	currentLyricLinesAtom,
	isDarkThemeAtom,
	newLyricLinesAtom,
	toolModeAtom,
} from "../../states";
import { parseLyric } from "../../utils/ttml-parser";
import exportTTMLText from "../../utils/ttml-writer.ts";
import styles from "./index.module.css";

let controlsPlatform = import.meta.env
	.TAURI_ENV_PLATFORM as WindowControlsProps["platform"];
if (import.meta.env.TAURI_ENV_PLATFORM === "darwin") {
	controlsPlatform = "macos";
}

export const TitleBar: FC = () => {
	const isDarkTheme = useAtomValue(isDarkThemeAtom);
	const [toolMode, setToolMode] = useAtom(toolModeAtom);
	const newLyricLine = useSetAtom(newLyricLinesAtom);
	const editLyricLine = useSetAtom(currentLyricLinesAtom);
	const store = useStore();
	return (
		<Flex width="100%" align="stretch">
			<Flex flexGrow="1" align="center">
				<Flex p="2" pr="0" align="center" gap="2">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="soft">
								<Trans i18nKey="topBar.menu.file">文件</Trans>
								<DropdownMenu.TriggerIcon />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Item
								onClick={() => {
									newLyricLine();
								}}
							>
								新建 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={() => {
									const inputEl = document.createElement("input");
									inputEl.type = "file";
									inputEl.accept = ".ttml,*/*";
									inputEl.addEventListener(
										"change",
										async () => {
											const file = inputEl.files?.[0];
											if (!file) return;
											try {
												const ttmlText = await file.text();
												const ttmlData = parseLyric(ttmlText);
												editLyricLine(ttmlData);
											} catch (e) {
												console.error("Failed to parse TTML file", e);
											}
										},
										{
											once: true,
										},
									);
									inputEl.click();
								}}
							>
								打开 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={() => {
									try {
										saveFile(
											exportTTMLText(store.get(currentLyricLinesAtom)),
											"lyric.ttml",
										).catch(console.error);
									} catch (e) {
										console.error("Failed to save TTML file", e);
									}
								}}
							>
								保存 TTML 文件
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="soft">
								<Trans i18nKey="topBar.menu.edit">编辑</Trans>
								<DropdownMenu.TriggerIcon />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Item>撤销</DropdownMenu.Item>
							<DropdownMenu.Item>重做</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Flex>
				<Box flexGrow="1" height="100%" data-tauri-drag-region />
			</Flex>
			<Flex align="center" flexShrink="0">
				<SegmentedControl.Root
					value={toolMode}
					onValueChange={(v) => setToolMode(v as ToolMode)}
					// size="1"
				>
					<SegmentedControl.Item value={ToolMode.Edit}>
						<Trans i18nKey="topBar.modeBtns.edit">编辑模式</Trans>
					</SegmentedControl.Item>
					<SegmentedControl.Item value={ToolMode.Sync}>
						<Trans i18nKey="topBar.modeBtns.sync">打轴模式</Trans>
					</SegmentedControl.Item>
					<SegmentedControl.Item value={ToolMode.Preview}>
						<Trans i18nKey="topBar.modeBtns.preview">预览模式</Trans>
					</SegmentedControl.Item>
				</SegmentedControl.Root>
			</Flex>
			<Flex flexGrow="1" direction="row" align="stretch">
				<Box flexGrow="1" height="100%" data-tauri-drag-region />
				{!import.meta.env.TAURI_ENV_PLATFORM ||
				controlsPlatform !== "windows" ? (
					<Flex flexBasis="0" align="center" pr="2">
						<Text color="gray" wrap="nowrap" size="2">
							Apple Music-like Lyrics TTML Tool
						</Text>
					</Flex>
				) : (
					<WindowControls
						className={classNames(styles.titlebar, isDarkTheme && "dark")}
						style={{
							minHeight: "fit-content",
						}}
						platform="windows"
					/>
				)}
			</Flex>
		</Flex>
		// <WindowTitlebar
		// 	className={isDarkTheme ? "dark" : undefined}
		// 	style={{
		// 		minHeight: "fit-content",
		// 	}}
		// 	controlsOrder="platform"
		// 	windowControlsProps={{
		// 		platform: controlsPlatform,
		// 		hide:
		// 			!import.meta.env.TAURI_ENV_PLATFORM || controlsPlatform !== "windows",
		// 			hideMethod: "visibility",
		// 		className: styles.titlebar,
		// 	}}
		// >

		// </WindowTitlebar>
	);
};
