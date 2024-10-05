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

import { Client, getClient } from "@tauri-apps/plugin-http";

interface EAPIResponse {
	code: number;
	error?: string;
}

interface EAPILyric {
	version: number;
	lyric: string;
}

interface EAPILyricResponse extends EAPIResponse {
	lrc?: EAPILyric;
	tlyric?: EAPILyric;
	romalrc?: EAPILyric;
	yromalrc?: EAPILyric;
	ytlrc?: EAPILyric;
}

let cachedClient: Client;
async function getCachedClient(): Promise<Client> {
	if (!cachedClient) {
		cachedClient = await getClient();
	}

	return cachedClient;
}

export async function getNCMLyric(songId: string) {
	const client = await getCachedClient();

	const res = await client.get<EAPILyricResponse>(
		`https://music.163.com/api/song/lyric/v1?tv=0&lv=0&rv=0&kv=0&yv=0&ytv=0&yrv=0&cp=false&id=${songId}`,
	);

	if (res.status < 200 && res.status >= 400) {
		throw new TypeError("获取网易云歌词失败");
	}

	return res.data;
}
