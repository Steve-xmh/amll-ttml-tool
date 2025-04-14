import {
    keyDeleteSelectionAtom,
	keyMoveNextLineAtom,
	keyMoveNextWordAtom,
	keyMovePrevLineAtom,
	keyMovePrevWordAtom,
	keyNewFileAtom,
	keyOpenAudioAtom,
	keyOpenFileAtom,
	keyPlaybackRateDownAtom,
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
	type KeyBindingAtom,
} from "$/states/keybindings";
import { formatKeyBindings, recordShortcut } from "$/utils/keybindings";
import { Box, Button, Grid, Table, TextField } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useState } from "react";

interface KeyBindingsEntry {
	atom: KeyBindingAtom;
	label: string;
}

const kb = (thisAtom: KeyBindingAtom, label: string): KeyBindingsEntry => ({
	atom: thisAtom,
	label,
});

const ENTRIES: KeyBindingsEntry[] = [
	kb(keyNewFileAtom, "新建文件"),
	kb(keyOpenFileAtom, "打开文件"),
	kb(keySaveFileAtom, "保存文件"),
	kb(keyOpenAudioAtom, "打开音频文件"),
	kb(keyUndoAtom, "撤销"),
	kb(keyRedoAtom, "重做"),
	kb(keySelectAllAtom, "全选"),
	kb(keySelectInvertedAtom, "反选"),
	kb(keySelectWordsOfMatchedSelectionAtom, "选中同类单词"),
	kb(keyDeleteSelectionAtom, "删除所选"),
	kb(keySwitchEditModeAtom, "模式切换 - 切换到编辑模式"),
	kb(keySwitchSyncModeAtom, "模式切换 - 切换到打轴模式"),
	kb(keySwitchPreviewModeAtom, "模式切换 - 切换到预览模式"),
	kb(keyMoveNextWordAtom, "打轴 - 移动到下一个单词"),
	kb(keyMovePrevWordAtom, "打轴 - 移动到上一个单词"),
	kb(keyMoveNextLineAtom, "打轴 - 移动到下一行开头"),
	kb(keyMovePrevLineAtom, "打轴 - 移动到上一行开头"),
	kb(keySyncStartAtom, "打轴 - 初始打轴"),
	kb(keySyncNextAtom, "打轴 - 步进打轴"),
	kb(keySyncEndAtom, "打轴 - 间奏打轴"),
	kb(keyPlayPauseAtom, "播放 - 暂停/继续播放"),
	kb(keySeekForwardAtom, "播放 - 快进 5 秒"),
	kb(keySeekBackwardAtom, "播放 - 快退 5 秒"),
	kb(keyVolumeUpAtom, "播放 - 调高音量"),
	kb(keyVolumeDownAtom, "播放 - 调低音量"),
	kb(keyPlaybackRateUpAtom, "播放 - 增加播放速度"),
	kb(keyPlaybackRateDownAtom, "播放 - 降低播放速度"),
];

const KeyBindingsEdit = ({
	entry,
}: {
	entry: KeyBindingsEntry;
}) => {
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
	return (
		<Grid columns="2" gapY="2">
			{ENTRIES.map((entry) => (
				<KeyBindingsEdit key={entry.label} entry={entry} />
			))}
		</Grid>
	);
};
