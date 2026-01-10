import { atom } from "jotai/index";
import { atomWithStorage } from "jotai/utils";

export const audioBufferAtom = atom<AudioBuffer | null>(null);
export const volumeAtom = atomWithStorage("volume", 0.5);
export const playbackRateAtom = atomWithStorage("playbackRate", 1);
export const audioPlayingAtom = atom(false);
export const loadedAudioAtom = atom(new Blob([]));
export const currentTimeAtom = atom(0);
export const currentDurationAtom = atom(0);
export const auditionTimeAtom = atom<number | null>(null);

export interface AudioTaskState {
	type: AudioTaskType;
	/**
	 * 转码进度，0 ~ 1 之间的浮点数
	 */
	progress: number;
}
export type AudioTaskType = "TRANSCODING" | "LOADING";
export const audioTaskStateAtom = atom<AudioTaskState | null>(null);
export const audioErrorAtom = atom<string | null>(null);
