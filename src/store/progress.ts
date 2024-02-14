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

import {defineStore} from "pinia";

interface ProgressState {
	label: string;
	progress: number;
	parent?: ProgressState;
}

export const useProgress = defineStore("progress", {
	state: () => ({
		currentProgresses: [] as ProgressState[],
	}),
	actions: {
		newProgress(label: string) {
			this.currentProgresses.push({
				label,
				progress: 0,
				parent: undefined,
			});
			return this.currentProgresses[this.currentProgresses.length - 1];
		},
		finishProgress(progress: ProgressState) {
			this.currentProgresses.splice(
				this.currentProgresses.indexOf(progress),
				1,
			);
		},
	},
});
