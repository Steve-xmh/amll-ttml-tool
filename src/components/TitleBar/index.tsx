import {
	keySwitchEditModeAtom,
	keySwitchPreviewModeAtom,
	keySwitchSyncModeAtom,
} from "$/states/keybindings.ts";
import { ToolMode, isDarkThemeAtom, toolModeAtom } from "$/states/main.ts";
import { useKeyBindingAtom } from "$/utils/keybindings.ts";
import { Box, Flex, SegmentedControl, Text } from "@radix-ui/themes";
import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";
import { type FC, useCallback } from "react";
import { Trans } from "react-i18next";
import { WindowControls, type WindowControlsProps } from "tauri-controls";
import { TopMenu } from "../TopMenu/index.tsx";
import styles from "./index.module.css";

let controlsPlatform = import.meta.env
	.TAURI_ENV_PLATFORM as WindowControlsProps["platform"];
if (import.meta.env.TAURI_ENV_PLATFORM === "darwin") {
	controlsPlatform = "macos";
}

export const TitleBar: FC = () => {
	const isDarkTheme = useAtomValue(isDarkThemeAtom);
	const [toolMode, setToolMode] = useAtom(toolModeAtom);

	const onSwitchEditMode = useCallback(() => {
		setToolMode(ToolMode.Edit);
	}, [setToolMode]);
	const onSwitchSyncMode = useCallback(() => {
		setToolMode(ToolMode.Sync);
	}, [setToolMode]);
	const onSwitchPreviewMode = useCallback(() => {
		setToolMode(ToolMode.Preview);
	}, [setToolMode]);

	useKeyBindingAtom(keySwitchEditModeAtom, onSwitchEditMode);
	useKeyBindingAtom(keySwitchSyncModeAtom, onSwitchSyncMode);
	useKeyBindingAtom(keySwitchPreviewModeAtom, onSwitchPreviewMode);

	return (
		<Flex width="100%" flexBasis="0" align="stretch">
			<Flex flexGrow="1" flexBasis="50vw" align="center">
				<TopMenu />
				<Box
					flexGrow="1"
					flexShrink="1"
					flexBasis="0"
					height="100%"
					data-tauri-drag-region
				/>
			</Flex>
			<Flex align="center" flexShrink="0">
				<SegmentedControl.Root
					value={toolMode}
					onValueChange={(v) => setToolMode(v as ToolMode)}
					// size="1"
				>
					<SegmentedControl.Item value={ToolMode.Edit}>
						<Trans i18nKey="topBar.modeBtns.edit">编辑</Trans>
					</SegmentedControl.Item>
					<SegmentedControl.Item value={ToolMode.Sync}>
						<Trans i18nKey="topBar.modeBtns.sync">打轴</Trans>
					</SegmentedControl.Item>
					<SegmentedControl.Item value={ToolMode.Preview}>
						<Trans i18nKey="topBar.modeBtns.preview">预览</Trans>
					</SegmentedControl.Item>
				</SegmentedControl.Root>
			</Flex>
			<Flex flexGrow="1" flexBasis="50vw" direction="row" align="stretch">
				<Box
					flexGrow="1"
					flexShrink="1"
					flexBasis="0"
					height="100%"
					data-tauri-drag-region
				/>
				{!import.meta.env.TAURI_ENV_PLATFORM ||
				controlsPlatform !== "windows" ? (
					<Flex
						flexBasis="0"
						align="center"
						pr="2"
						display={{
							xs: "none",
							sm: "flex",
							initial: "none",
						}}
					>
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
