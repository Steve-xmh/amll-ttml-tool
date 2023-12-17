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

import { defineStore } from "pinia";

export const useAudio = defineStore("audio", {
	state: () => ({
		playing: false,
		canPlay: false,
		audioURL: "",
		currentTime: 0,
		duration: 0,
	}),
	getters: {
		currentTimeMS: (state) => {
			return Math.floor(state.currentTime);
		},
	},
	actions: {
		setCurrentTime(currentTime: number) {
			this.currentTime = currentTime;
		},
	},
});
