import {atomWithStorage} from "jotai/utils";
import {atom} from "jotai";

export const audioElAtom = atom<HTMLAudioElement>(document.createElement("audio"));
export const volumeAtom = atomWithStorage("volume", 0.5);
export const playbackRateAtom = atomWithStorage("playbackRate", 1);
