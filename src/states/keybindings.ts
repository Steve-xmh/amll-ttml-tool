import type { WritableAtom } from "jotai";
import {
	type KeyBindingsConfig,
	atomWithKeybindingStorage,
} from "../utils/keybindings.ts";

// https://developer.mozilla.org/zh-CN/docs/Web/API/UI_Events/Keyboard_event_key_values

const IS_MAC = navigator.userAgent.includes("Mac");
const CONTROL_KEY = IS_MAC ? "Meta" : "Control";
const DELETE_KEY = IS_MAC ? "Backspace" : "Delete";

export type KeyBindingAtom = WritableAtom<
	KeyBindingsConfig,
	[update?: KeyBindingsConfig | undefined],
	Promise<void>
>;

// 文件
export const keyNewFileAtom = atomWithKeybindingStorage("newFile", [
	CONTROL_KEY,
	"KeyN",
]);
export const keyOpenFileAtom = atomWithKeybindingStorage("openFile", [
	CONTROL_KEY,
	"KeyO",
]);
export const keySaveFileAtom = atomWithKeybindingStorage("saveFile", [
	CONTROL_KEY,
	"KeyS",
]);

export const keyOpenAudioAtom = atomWithKeybindingStorage("openAudio", [
	CONTROL_KEY,
	"KeyM",
]);

// 撤销重做
export const keyUndoAtom = atomWithKeybindingStorage("openAudio", [
	CONTROL_KEY,
	"KeyZ",
]);
export const keyRedoAtom = atomWithKeybindingStorage(
	"openAudio",
	IS_MAC ? ["Shift", CONTROL_KEY, "KeyZ"] : [CONTROL_KEY, "KeyY"],
);

// 选中
export const keyUnselectAllAtom = atomWithKeybindingStorage("selectAll", [
	CONTROL_KEY,
	"Escape",
]);
export const keySelectAllAtom = atomWithKeybindingStorage("selectAll", [
	CONTROL_KEY,
	"KeyA",
]);
export const keySelectInvertedAtom = atomWithKeybindingStorage("selectNext", [
	CONTROL_KEY,
	"KeyI",
]);
export const keySelectWordsOfMatchedSelectionAtom = atomWithKeybindingStorage(
	"selectWordsOfMatchedSelection",
	[CONTROL_KEY, "F2"],
);

// 删除所选
export const keyDeleteSelectionAtom = atomWithKeybindingStorage(
	"deleteSelection",
	[DELETE_KEY],
);

// 模式切换
export const keySwitchEditModeAtom = atomWithKeybindingStorage(
	"switchEditMode",
	["Shift", "Digit1"],
);
export const keySwitchSyncModeAtom = atomWithKeybindingStorage(
	"switchSyncMode",
	["Shift", "Digit2"],
);
export const keySwitchPreviewModeAtom = atomWithKeybindingStorage(
	"switchPreviewMode",
	["Shift", "Digit3"],
);
// 打轴 - 移动单词
export const keyMoveNextWordAtom = atomWithKeybindingStorage("moveNextWord", [
	"KeyD",
]);
export const keyMovePrevWordAtom = atomWithKeybindingStorage("movePrevWord", [
	"KeyA",
]);
export const keyMoveNextLineAtom = atomWithKeybindingStorage("moveNextLine", [
	"KeyS",
]);
export const keyMovePrevLineAtom = atomWithKeybindingStorage("movePrevLine", [
	"KeyW",
]);
// 打轴 - 记录时间戳
export const keySyncStartAtom = atomWithKeybindingStorage("syncStart", [
	"KeyF",
]);
export const keySyncNextAtom = atomWithKeybindingStorage("syncNext", ["KeyG"]);
export const keySyncEndAtom = atomWithKeybindingStorage("syncEnd", ["KeyH"]);

// 音频控制
export const keyPlayPauseAtom = atomWithKeybindingStorage("playPause", [
	"Space",
]);
export const keySeekForwardAtom = atomWithKeybindingStorage("seekForward", [
	"ArrowRight",
]);
export const keySeekBackwardAtom = atomWithKeybindingStorage("seekBackward", [
	"ArrowLeft",
]);
export const keyVolumeUpAtom = atomWithKeybindingStorage("volumeUp", [
	"ArrowUp",
]);
export const keyVolumeDownAtom = atomWithKeybindingStorage("volumeDown", [
	"ArrowDown",
]);
export const keyPlaybackRateUpAtom = atomWithKeybindingStorage(
	"playbackRateUp",
	["BracketRight"],
);
export const keyPlaybackRateDownAtom = atomWithKeybindingStorage(
	"playbackRateDown",
	["BracketLeft"],
);
