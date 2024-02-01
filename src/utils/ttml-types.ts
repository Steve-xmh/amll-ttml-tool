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

export interface TTMLMetadata {
	/** 歌词所匹配的网易云音乐 ID */
	ncmMusicId?: string[];
	/** 歌词所匹配的 QQ 音乐 ID */
	qqMusicId?: string[];
	/** 歌词所匹配的 Spotify 音乐 ID */
	spotifyId?: string[];
	/** 歌词所匹配的 Apple Music 音乐 ID */
	appleMusicId?: string[];
	/** 歌词所匹配的 ISRC 编码 */
	isrc?: string[];
	/** 歌词所匹配的歌曲名 */
	musicName?: string;
	/** 歌词所匹配的歌手名 */
	artists?: string[];
	/** 歌词所匹配的专辑名 */
	album?: string;
	/** 逐词歌词作者 Github ID，例如 Steve-xmh */
	ttmlAuthorGithub?: string;

	[key: string]: string | string[] | undefined;
}

export interface TTMLLyric {
	metadata: TTMLMetadata;
	lyricLines: LyricLine[];
}

export interface LyricWord {
	startTime: number;
	endTime: number;
	word: string;
	emptyBeat?: number;
}

export interface LyricLine {
	words: LyricWord[];
	translatedLyric: string;
	romanLyric: string;
	isBG: boolean;
	isDuet: boolean;
	startTime: number;
	endTime: number;
}
