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

		lyricLines = rawLines.map((line) => ({
			...newLyricLine(),
			words: line.words.map((word) => ({
				...newLyricWord(),
				word: word.word,
				startTime: word.startTime,
				endTime: word.endTime,
			})),
			startTime: line.startTime,
			endTime: line.endTime,
		}));
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
