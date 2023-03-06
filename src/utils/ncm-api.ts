import { getClient, Client } from "@tauri-apps/api/http";

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
