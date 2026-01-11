import { parseLrc } from "@applemusic-like-lyrics/lyric";
import {
	type LyricLine,
	newLyricLine,
	newLyricWord,
	type TTMLLyric,
	type TTMLMetadata,
} from "$/types/ttml";
import type { LrcLibTrack } from "../types";

export function convertLrcLibTrackToTTML(track: LrcLibTrack): TTMLLyric {
	let lyricLines: LyricLine[] = [];

	if (track.syncedLyrics) {
		const rawLines = parseLrc(track.syncedLyrics);

		lyricLines = rawLines.map((line) => {
			const processedWords = line.words.map((word, index) => {
				let text = word.word;

				// 移除前导和尾随空格
				// LRCLIB 的歌词时间戳和歌词文本之间存在一个美观空格，
				// 这里直接移除整行的前导和尾随空格了
				if (index === 0) {
					text = text.trimStart();
				}

				if (index === line.words.length - 1) {
					text = text.trimEnd();
				}

				return {
					...newLyricWord(),
					word: text,
					startTime: word.startTime,
					endTime: word.endTime,
				};
			});

			return {
				...newLyricLine(),
				words: processedWords,
				startTime: line.startTime,
				endTime: line.endTime,
			};
		});
	} else if (track.plainLyrics) {
		const lines = track.plainLyrics.split(/\r?\n/);

		lyricLines = lines
			.map((text) => text.trim())
			.filter((text) => text.length > 0)
			.map((text) => {
				const line = newLyricLine();
				const word = newLyricWord();
				word.word = text;
				line.words = [word];
				return line;
			});
	}

	const metadata: TTMLMetadata[] = [];
	if (track.name) metadata.push({ key: "musicName", value: [track.name] });
	if (track.artistName)
		metadata.push({ key: "artists", value: [track.artistName] });
	if (track.albumName)
		metadata.push({ key: "album", value: [track.albumName] });

	return {
		lyricLines,
		metadata,
	};
}
