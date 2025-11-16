import { atom } from "jotai/index";
import { atomWithStorage } from "jotai/utils";

export const audioBufferAtom = atom<AudioBuffer | null>(null);
// export const audioElAtom = atom<HTMLAudioElement | null>(null);
export const volumeAtom = atomWithStorage("volume", 0.5);
export const playbackRateAtom = atomWithStorage("playbackRate", 1);
export const audioPlayingAtom = atom(false);
export const loadedAudioAtom = atom(new Blob([]));
export const currentTimeAtom = atom(0);
export const currentDurationAtom = atom(0);
