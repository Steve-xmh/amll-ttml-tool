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

export interface DynamicLyricWord {
	time: number;
	duration: number;
	flag: number;
	word: string;
}

export interface LyricLine extends BackgroundLyricLine {
	beginTime: number;
	duration: number;
	shouldAlignRight?: boolean;
	backgroundLyric?: LyricLine;
}

export interface BackgroundLyricLine {
	originalLyric: string;
	translatedLyric?: string;
	romanLyric?: string;
	dynamicLyricTime?: number;
	isBackgroundLyric?: boolean;
	dynamicLyric?: DynamicLyricWord[];
}

export interface LyricPureLine {
	time: number;
	lyric: string;
}
