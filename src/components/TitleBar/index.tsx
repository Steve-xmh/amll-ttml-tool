import {keySwitchEditModeAtom, keySwitchPreviewModeAtom, keySwitchSyncModeAtom,} from "$/states/keybindings.ts";
import {ToolMode, toolModeAtom} from "$/states/main.ts";
import {useKeyBindingAtom} from "$/utils/keybindings.ts";
import {SegmentedControl, Text} from "@radix-ui/themes";
import {useAtom} from "jotai";
import {type FC, useCallback} from "react";
import {Trans} from "react-i18next";
import WindowControls from "$/components/WindowControls";
import {TopMenu} from "../TopMenu/index.tsx";

export const TitleBar: FC = () => {
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
		<WindowControls
			startChildren={<TopMenu/>}
			titleChildren={
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
			}
			endChildren={
				!import.meta.env.TAURI_ENV_PLATFORM && (
					<Text color="gray" wrap="nowrap" size="2" mr="2">
						Apple Music-like Lyrics TTML Tool
					</Text>
				)
			}
		/>
	);
};
