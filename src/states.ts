import { atom } from "jotai";
import { PlaylistResource, PlaylistSong } from "./utils/am-api";
import { LyricLine } from "./utils/lyric-types";

export const currentPageAtom = atom("user-media-token");
export const selectedPlaylistAtom = atom<PlaylistResource | null>(null);
export const selectedSongsAtom = atom<PlaylistSong[]>([]);

export type SongPairData = PlaylistSong & {
	ncmID: string;
	lyric: LyricLine[];
	mixinLyric: LyricLine[];
};

export const pairSongsAtom = atom<SongPairData[]>([]);
