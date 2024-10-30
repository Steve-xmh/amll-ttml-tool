import { atomWithKeybindingStorage } from "../utils/keybindings.ts";

const IS_MAC = navigator.userAgent.includes("Mac");
const CONTROL_KEY = IS_MAC ? "Meta" : "Control";

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
