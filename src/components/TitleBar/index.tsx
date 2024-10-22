import { Button, DropdownMenu, Flex, Select } from "@radix-ui/themes";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { FC } from "react";
import { Trans } from "react-i18next";
import { type WindowControlsProps, WindowTitlebar } from "tauri-controls";
import {
	ToolMode,
	currentLyricLinesAtom,
	isDarkThemeAtom,
	newLyricLinesAtom,
	toolModeAtom,
} from "../../states";
import { parseLyric } from "../../utils/ttml-parser";
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
	return (
		<WindowTitlebar
			className={isDarkTheme ? "dark" : undefined}
			style={{
				minHeight: "fit-content",
			}}
			controlsOrder="platform"
			windowControlsProps={{
				platform: controlsPlatform,
				hide: !import.meta.env.TAURI_ENV_PLATFORM || controlsPlatform !== "windows",
				className: styles.titlebar,
			}}
		>
			<Flex m="2" justify="center" gap="2">
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
						<DropdownMenu.Item onClick={() => {}}>
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
				<Select.Root
					defaultValue={toolMode}
					onValueChange={(v) => setToolMode(v as ToolMode)}
				>
					<Select.Trigger />
					<Select.Content>
						<Select.Item value={ToolMode.Edit}>
							<Trans i18nKey="topBar.modeBtns.edit">编辑模式</Trans>
						</Select.Item>
						<Select.Item value={ToolMode.Preview}>
							<Trans i18nKey="topBar.modeBtns.preview">预览模式</Trans>
						</Select.Item>
					</Select.Content>
				</Select.Root>
			</Flex>
		</WindowTitlebar>
	);
};
