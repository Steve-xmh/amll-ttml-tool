/*
 * Copyright 2023-2024 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import {defineStore} from "pinia";

export enum UILayoutMode {
	Simple = "simple",
	Advanced = "advanced",
}

export const useSettings = defineStore("settings", {
	state: () => ({
		showTranslateLine: false,
		showRomanLine: false,
		showJpnRomaji: false,
		volume: 0.5,
		speed: 1,
		timeOffset: 0,

		showingTutorial: true,

		uiLayoutMode: UILayoutMode.Simple,

		keybindings: {
			resumeOrPause: ["Space"],
			seekPlayForward5s: ["ArrowRight"],
			seekPlayBackward5s: ["ArrowLeft"],
			seekPlayForward1s: [],
			seekPlayBackward1s: [],
			seekPlayForward100ms: [],
			seekPlayBackward100ms: [],
			volumeUp: ["ArrowUp"],
			volumeDown: ["ArrowDown"],
			speedUp: ["BracketLeft"],
			speedDown: ["BracketRight"],

			openMusicFile: [],
			openLyricFile: [],
			saveLyricFile: [],

			moveLeftWord: ["KeyA"],
			moveRightWord: ["KeyD"],
			moveUpLine: ["KeyW"],
			moveDownLine: ["KeyS"],
			seekLeftWord: ["KeyR"],
			seekRightWord: ["KeyY"],
			setCurWordStartTime: ["KeyF"],
			stepWordAndSetTime: ["KeyG"],
			stepWordAndSetTimeAlias1: [],
			stepWordAndSetTimeAlias2: [],
			stepWordAndSetTimeAlias3: [],
			stepWordAndSetEndTime: ["KeyH"],
			setLineStartTime: ["KeyV"],
			setLineEndTime: ["KeyN"],
		},
	}),
	persist: true,
});
