/*
 * Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { atom } from "jotai";
import { loadable } from "jotai/utils";
import { genWaveform } from "./utils/gen-waveform";
import type { TTMLLyric } from "./utils/ttml-types";

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

export const ribbonBarHeightAtom = atom(0);
export const toolModeAtom = atom(ToolMode.Edit);
export const darkModeAtom = atom(DarkMode.Auto);
export const isDarkThemeAtom = atom((get) => {
	if (get(darkModeAtom) === DarkMode.Auto) return get(autoDarkModeAtom);
	return get(darkModeAtom) === DarkMode.Dark;
});
export const autoDarkModeAtom = atom(true);
export const audioPlayingAtom = atom(false);
export const currentTimeAtom = atom(0);
export const currentDurationAtom = atom(0);
export const loadedAudioAtom = atom(new Blob([]));
export const audioWaveformAtom = atom(async (get) => {
	const audio = get(loadedAudioAtom);
	if (audio.size > 1024 * 1024 * 64) return new Float32Array();
	const [waveform] = await genWaveform(audio);
	return waveform;
});
export const loadableAudioWaveformAtom = loadable(audioWaveformAtom);

// 歌词行编辑上下文
export const undoStackSizeAtom = atom(256);
export const lyricLineEditContextAtom = atom({
	undoStack: [
		{
			lyricLines: [],
			metadata: [],
		},
	] as TTMLLyric[],
	index: 0,
});
export const currentLyricLinesAtom = atom(
	(get) => {
		const ctx = get(lyricLineEditContextAtom);
		return ctx.undoStack[ctx.index];
	},
	(
		get,
		set,
		newState:
			| TTMLLyric
			| ((newState: TTMLLyric, oldRefState: TTMLLyric) => void),
	) => {
		const ctx = get(lyricLineEditContextAtom);
		const oldState = ctx.undoStack[ctx.index];
		const undoStackSize = get(undoStackSizeAtom);
		const newCtx = {
			...ctx,
			undoStack: ctx.undoStack.slice(
				Math.max(0, ctx.index - undoStackSize),
				ctx.index + 1,
			),
		};
		newCtx.index = newCtx.undoStack.length;
		if (newState instanceof Function) {
			const cloned = structuredClone(oldState);
			newState(cloned, oldState);
			newCtx.undoStack.push(cloned);
		} else {
			newCtx.undoStack.push(newState);
		}
		// 处理某些数字，避免出现小数和部分非法数字，导致 AMLL Lyric 模块导出出错
		for (const line of newCtx.undoStack[newCtx.index].lyricLines) {
			line.startTime = (line.startTime || 0) | 0;
			line.endTime = (line.endTime || 0) | 0;
			for (const word of line.words) {
				word.startTime = (word.startTime || 0) | 0;
				word.endTime = (word.endTime || 0) | 0;
				word.emptyBeat = (word.emptyBeat || 0) | 0;
			}
		}
		set(lyricLineEditContextAtom, newCtx);
	},
);
export const undoLyricLinesAtom = atom(null, (get, set) => {
	const ctx = get(lyricLineEditContextAtom);
	if (ctx.index === 0) return;
	ctx.index--;
	set(lyricLineEditContextAtom, { ...ctx });
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
		set(lyricLineEditContextAtom, {
			undoStack: [newState],
			index: 0,
		});
		set(selectedLinesAtom, new Set());
		set(selectedWordsAtom, new Set());
	},
);
export const selectedLinesAtom = atom(new Set<string>());
export const selectedWordsAtom = atom(new Set<string>());
