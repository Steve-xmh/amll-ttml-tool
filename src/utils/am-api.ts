import { Client, getClient, ResponseType } from "@tauri-apps/api/http";

export interface PlaylistSong {
	attributes: {
		albumName: string;
		artistName: string;
		name: string;
		hasLyrics: boolean;
		artistUrl: string;
		durationInMillis: number;
		playParams: {
			id: string;
			catalogId: string;
		};
		artwork: {
			url: string;
		};
	};
	id: string;
	type: "library-songs";
	href: string;
}

export interface PlaylistData {
	resources: {
		"library-songs": {
			[songId: string]: PlaylistSong;
		};
		songs: {
			[songId: string]: {
				attributes: {
					artistUrl: string;
					durationInMillis: number;
				};
				id: string;
				type: "songs";
				href: string;
			};
		};
	};
}

export interface PlaylistsEntry {
	id: string;
	type: "library-playlists";
	href: string;
}

export interface PlaylistAttributes {
	canEdit: boolean;
	name: string;
	isPublic: boolean;
	canDelete: boolean;
	dateAdded: string;
	hasCatalog: boolean;
	playParams: {
		id: string;
		isLibrary: boolean;
		kind: "playlist";
	};
}

export type PlaylistResource = PlaylistsEntry & {
	attributes: PlaylistAttributes;
};

export interface PlaylistsData {
	data: PlaylistsEntry[];
	meta: {
		total: number;
	};
	resources: {
		"library-playlists": {
			[id: string]: PlaylistResource;
		};
	};
}

export interface SyllableLyricData {
	data: {
		attributes: {
			playParams: {
				catallogId: string;
				displayType: number;
				id: string;
				kind: "lyric";
			};
			ttml: string;
		};
		id: string;
		type: "syllable-lyrics";
	}[];
}

export class AppleMusicAPI {
	private accessToken: string = "";
	private indexFile: string = "";

	constructor(
		public mediaUserToken: string = localStorage.getItem(
			"am-media-user-token",
		) || "",
		public language: string = "zh-CN",
	) {}

	get headers() {
		return {
			authorization: `Bearer ${this.accessToken}`,
			Connection: "Keep-Alive",
			"Content-Type": "application/json",
			Origin: "https://music.apple.com",
			Referer: "https://music.apple.com/",
			"Accept-Encoding": "gzip, deflate",
			"Accept-Language": `${this.language},en;q=0.9`,
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
				"(KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
			"Media-User-Token": this.mediaUserToken,
			"x-apple-renewal": "true",
		};
	}

	private _client: Client | undefined;
	private async getClient() {
		if (!this._client) {
			this._client = await getClient();
		}
		return this._client;
	}

	private async clientGet<T = unknown>(url: string) {
		const client = await this.getClient();

		const playListRes = await client.get<T>(url, {
			headers: this.headers,
		});

		if (playListRes.status < 200 || playListRes.status >= 400)
			throw new TypeError("请求失败");
		
		console.log(url, playListRes)

		return playListRes;
	}

	async login() {
		if (this.mediaUserToken.length === 0) {
			throw new TypeError("没有提供用户媒体令牌");
		}

		const client = await this.getClient();
		if (this.indexFile.length === 0) {
			const res = await client.get<string>(
				"https://music.apple.com/us/search",
				{
					headers: this.headers,
					responseType: ResponseType.Text,
				},
			);

			const indexFile = res.data.match(/(?=index\.)(.*?)(?=\.js")/);

			if (!indexFile) throw new TypeError("无法获取到 index.js 路径");

			this.indexFile = indexFile[0];
		}

		if (this.accessToken.length === 0) {
			const indexFileRes = await client.get<string>(
				`https://music.apple.com/assets/${this.indexFile}.js`,
				{
					headers: this.headers,
					responseType: ResponseType.Text,
				},
			);

			const accessToken = indexFileRes.data.match(/(?=eyJh)(.*?)(?=")/);

			if (!accessToken) throw new TypeError("无法获取到访问令牌");

			this.accessToken = accessToken[0];
		}

		// 尝试获取歌曲列表
		await this.getAllPlaylists();

		localStorage.setItem("am-media-user-token", this.mediaUserToken);
	}

	async getLyric(songId: string | number): Promise<SyllableLyricData> {
		const lyricRes = await this.clientGet<SyllableLyricData>(
			`https://amp-api.music.apple.com/v1/catalog/cn/songs/${songId}/syllable-lyrics`,
		);

		return lyricRes.data;
	}

	async getPlaylist(playlistId: string): Promise<PlaylistData> {
		const playlistRes = await this.clientGet<PlaylistData>(
			`https://amp-api.music.apple.com/v1/me/library/playlists/${playlistId}?art%5Burl%5D=f&fields%5Bsongs%5D=artistUrl%2Cartwork%2CdurationInMillis%2Curl&format%5Bresources%5D=map&include=name%2Ccatalog%2Cartists%2Ctracks%2Cfields&include%5Blibrary-playlists%5D=catalog%2Ctracks%2Cfields%2Cplaylists&include%5Btracks%5D=artists%2Ctracks&l=zh-Hans-CN&omit%5Bresource%5D=autos&platform=web`,
		);

		return playlistRes.data;
	}

	async getAllPlaylists(): Promise<PlaylistsData> {
		const playListRes = await this.clientGet<PlaylistsData>(
			"https://amp-api.music.apple.com/v1/me/library/playlist-folders/p.playlistsroot/children" +
				"?art%5Burl%5D=f&format%5Bresources%5D=map&include=name%2CcanDelete%2CcanEdit&l=zh-Hans-CN&offset=0&omit%5Bresource%5D=autos&platform=web",
		);

		return playListRes.data;
	}
}

export const globalAMAPI = new AppleMusicAPI();

// window.globalAMAPI = globalAMAPI;
