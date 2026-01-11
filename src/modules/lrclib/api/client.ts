import type { LrcLibTrack } from "../types";

const BASE_URL = "https://lrclib.net/api";

export const LrcLibApi = {
	/**
	 * 搜索歌曲
	 * @param query 搜索关键词 (如 "歌名 歌手")
	 * @returns @see {@link LrcLibTrack}
	 * @throws 在 API 请求失败时抛出错误
	 */
	async search(query: string): Promise<LrcLibTrack[]> {
		if (!query.trim()) return [];

		try {
			const response = await fetch(
				`${BASE_URL}/search?q=${encodeURIComponent(query)}`,
			);
			if (!response.ok) {
				throw new Error(`LRCLIB Search failed: ${response.statusText}`);
			}
			const data = (await response.json()) as LrcLibTrack[];
			return data;
		} catch (error) {
			console.error("LRCLIB API Error:", error);
			throw error;
		}
	},

	/**
	 * 根据 ID 获取歌曲详情
	 * @param id 歌曲 ID
	 * @returns @see {@link LrcLibTrack}
	 * @throws 在 API 请求失败时抛出错误
	 */
	async getById(id: number): Promise<LrcLibTrack> {
		try {
			const response = await fetch(`${BASE_URL}/get/${id}`);
			if (!response.ok) {
				throw new Error(`LRCLIB Get failed: ${response.statusText}`);
			}
			return (await response.json()) as LrcLibTrack;
		} catch (error) {
			console.error("LRCLIB API Error:", error);
			throw error;
		}
	},
};
