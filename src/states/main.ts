/*
 * Copyright 2023-2025 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { type SetStateAction, atom } from "jotai";
import { REDO, UNDO, withHistory } from "jotai-history";
import type { TTMLLyric } from "../utils/ttml-types";

export enum DarkMode {
	Auto = "auto",
	Light = "light",
	Dark = "dark",
}

export enum ToolMode {
	Edit = "edit",
	Sync = "sync",
	Preview = "preview",
}

export const toolModeAtom = atom(ToolMode.Edit);
export const darkModeAtom = atom(DarkMode.Auto);
export const isDarkThemeAtom = atom((get) => {
	if (get(darkModeAtom) === DarkMode.Auto) return get(autoDarkModeAtom);
	return get(darkModeAtom) === DarkMode.Dark;
});
export const autoDarkModeAtom = atom(true);

// 歌词行编辑上下文
export const lyricLinesAtom = atom({
	lyricLines: [],
	metadata: [],
} as TTMLLyric);
const trackChangeAtom = atom(
	(get) => {
		const current = get(lyricLinesAtom);
		console.log("lyricLines atom changed", current);
		return current;
	},
	(_get, set, value: SetStateAction<TTMLLyric>) => {
		set(lyricLinesAtom, value);
	},
);
export const undoableLyricLinesAtom = withHistory(trackChangeAtom, 256);
export const undoLyricLinesAtom = atom(null, (_get, set) => {
	set(undoableLyricLinesAtom, UNDO);
});
export const redoLyricLinesAtom = atom(null, (_get, set) => {
	set(undoableLyricLinesAtom, REDO);
});
export const splitWordStateAtom = atom({
	wordIndex: -1,
	lineIndex: -1,
	word: "",
});
export const newLyricLinesAtom = atom(
	null,
	(
		_get,
		set,
		newState: TTMLLyric = {
			lyricLines: [],
			metadata: [],
		},
	) => {
		set(lyricLinesAtom, newState);
		set(selectedLinesAtom, new Set());
		set(selectedWordsAtom, new Set());
	},
);
export const selectedLinesAtom = atom(new Set<string>());
export const selectedWordsAtom = atom(new Set<string>());

export const saveFileNameAtom = atom("lyric.ttml");
