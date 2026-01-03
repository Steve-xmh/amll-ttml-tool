import { Box, Grid, TextField } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type KeyBindingAtom,
	keyAuditionSelectionAfterAtom,
	keyAuditionSelectionAtom,
	keyAuditionSelectionBeforeAtom,
	keyDeleteSelectionAtom,
	keyMoveNextLineAtom,
	keyMoveNextWordAndPlayAtom,
	keyMoveNextWordAtom,
	keyMovePrevLineAtom,
	keyMovePrevWordAndPlayAtom,
	keyMovePrevWordAtom,
	keyNewFileAtom,
	keyOpenAudioAtom,
	keyOpenFileAtom,
	keyPlaybackRateDownAtom,
	keyPlaybackRateResetAtom,
	keyPlaybackRateUpAtom,
	keyPlayPauseAtom,
	keyRedoAtom,
	keySaveFileAtom,
	keySeekBackwardAtom,
	keySeekForwardAtom,
	keySelectAllAtom,
	keySelectInvertedAtom,
	keySelectWordsOfMatchedSelectionAtom,
	keySwitchEditModeAtom,
	keySwitchPreviewModeAtom,
	keySwitchSyncModeAtom,
	keySyncEndAtom,
	keySyncNextAtom,
	keySyncStartAtom,
	keyUndoAtom,
	keyVolumeDownAtom,
	keyVolumeUpAtom,
} from "$/states/keybindings";
import { formatKeyBindings, recordShortcut } from "$/utils/keybindings";

interface KeyBindingsEntry {
	atom: KeyBindingAtom;
	label: string;
}

const kb = (thisAtom: KeyBindingAtom, label: string): KeyBindingsEntry => ({
	atom: thisAtom,
	label,
});

const KeyBindingsEdit = ({ entry }: { entry: KeyBindingsEntry }) => {
	const [key, setKey] = useAtom(entry.atom);
	const [listening, setListening] = useState(false);

	return (
		<>
			<Box>{entry.label}</Box>
			<Box>
				<TextField.Root
					onClick={async () => {
						try {
							setListening(true);
							const newKey = await recordShortcut();
							setKey(newKey);
						} catch {
						} finally {
							setListening(false);
						}
					}}
					size="1"
					value={listening ? "请按下按键..." : formatKeyBindings(key)}
					readOnly
				/>
			</Box>
		</>
	);
};

export const SettingsKeyBindingsDialog = () => {
	const { t } = useTranslation();

	const ENTRIES: KeyBindingsEntry[] = useMemo(
		() => [
			kb(keyNewFileAtom, t("settingsDialog.keybindings.newFile", "新建文件")),
			kb(keyOpenFileAtom, t("settingsDialog.keybindings.openFile", "打开文件")),
			kb(keySaveFileAtom, t("settingsDialog.keybindings.saveFile", "保存文件")),
			kb(
				keyOpenAudioAtom,
				t("settingsDialog.keybindings.openAudio", "打开音频文件"),
			),
			kb(keyUndoAtom, t("settingsDialog.keybindings.undo", "撤销")),
			kb(keyRedoAtom, t("settingsDialog.keybindings.redo", "重做")),
			kb(keySelectAllAtom, t("settingsDialog.keybindings.selectAll", "全选")),
			kb(
				keySelectInvertedAtom,
				t("settingsDialog.keybindings.selectInverted", "反选"),
			),
			kb(
				keySelectWordsOfMatchedSelectionAtom,
				t(
					"settingsDialog.keybindings.selectWordsOfMatchedSelection",
					"选中同类单词",
				),
			),
			kb(
				keyDeleteSelectionAtom,
				t("settingsDialog.keybindings.deleteSelection", "删除所选"),
			),
			kb(
				keySwitchEditModeAtom,
				t(
					"settingsDialog.keybindings.switchEditMode",
					"模式切换 - 切换到编辑模式",
				),
			),
			kb(
				keySwitchSyncModeAtom,
				t(
					"settingsDialog.keybindings.switchSyncMode",
					"模式切换 - 切换到打轴模式",
				),
			),
			kb(
				keySwitchPreviewModeAtom,
				t(
					"settingsDialog.keybindings.switchPreviewMode",
					"模式切换 - 切换到预览模式",
				),
			),
			kb(
				keyMoveNextWordAtom,
				t("settingsDialog.keybindings.moveNextWord", "打轴 - 移动到下一个单词"),
			),
			kb(
				keyMovePrevWordAtom,
				t("settingsDialog.keybindings.movePrevWord", "打轴 - 移动到上一个单词"),
			),
			kb(
				keyMoveNextWordAndPlayAtom,
				t(
					"settingsDialog.keybindings.moveNextWordAndPlay",
					"打轴 - 移动到下一个单词并播放",
				),
			),
			kb(
				keyMovePrevWordAndPlayAtom,
				t(
					"settingsDialog.keybindings.movePrevWordAndPlay",
					"打轴 - 移动到上一个单词并播放",
				),
			),
			kb(
				keyMoveNextLineAtom,
				t("settingsDialog.keybindings.moveNextLine", "打轴 - 移动到下一行开头"),
			),
			kb(
				keyMovePrevLineAtom,
				t("settingsDialog.keybindings.movePrevLine", "打轴 - 移动到上一行开头"),
			),
			kb(
				keySyncStartAtom,
				t("settingsDialog.keybindings.syncStart", "打轴 - 初始打轴"),
			),
			kb(
				keySyncNextAtom,
				t("settingsDialog.keybindings.syncNext", "打轴 - 步进打轴"),
			),
			kb(
				keySyncEndAtom,
				t("settingsDialog.keybindings.syncEnd", "打轴 - 间奏打轴"),
			),
			kb(
				keyPlayPauseAtom,
				t("settingsDialog.keybindings.playPause", "播放 - 暂停/继续播放"),
			),
			kb(
				keySeekForwardAtom,
				t("settingsDialog.keybindings.seekForward", "播放 - 快进 5 秒"),
			),
			kb(
				keySeekBackwardAtom,
				t("settingsDialog.keybindings.seekBackward", "播放 - 快退 5 秒"),
			),
			kb(
				keyVolumeUpAtom,
				t("settingsDialog.keybindings.volumeUp", "播放 - 调高音量"),
			),
			kb(
				keyVolumeDownAtom,
				t("settingsDialog.keybindings.volumeDown", "播放 - 调低音量"),
			),
			kb(
				keyPlaybackRateUpAtom,
				t("settingsDialog.keybindings.playbackRateUp", "播放 - 增加播放速度"),
			),
			kb(
				keyPlaybackRateDownAtom,
				t("settingsDialog.keybindings.playbackRateDown", "播放 - 降低播放速度"),
			),
			kb(
				keyPlaybackRateResetAtom,
				t(
					"settingsDialog.keybindings.playbackRateReset",
					"播放 - 重置播放速度",
				),
			),
			kb(
				keyAuditionSelectionBeforeAtom,
				t(
					"settingsDialog.keybindings.auditionSelectionBefore",
					"频谱图 - 试听选中音节前 500 毫秒",
				),
			),
			kb(
				keyAuditionSelectionAtom,
				t(
					"settingsDialog.keybindings.auditionSelection",
					"频谱图 - 试听选中音节",
				),
			),
			kb(
				keyAuditionSelectionAfterAtom,
				t(
					"settingsDialog.keybindings.auditionSelectionAfter",
					"频谱图 - 试听选中音节后 500 毫秒",
				),
			),
		],
		[t],
	);

	return (
		<Grid columns="2" gapY="2">
			{ENTRIES.map((entry) => (
				<KeyBindingsEdit key={entry.label} entry={entry} />
			))}
		</Grid>
	);
};
