import {atom} from "jotai";
import { genWaveform } from "./utils/gen-waveform";
import { loadable } from "jotai/utils";

export const audioPlayingAtom = atom(false);
export const currentTimeAtom = atom(0);
export const currentDurationAtom = atom(0);
export const loadedAudioAtom = atom(new Blob([]));
export const audioWaveformAtom = atom(async (get) => {
    const audio = get(loadedAudioAtom);
    if (audio.size > 1024 * 1024 * 64) return new Float32Array();
    const [waveform,] = await genWaveform(audio);
    return waveform;
});
export const loadableAudioWaveformAtom = loadable(audioWaveformAtom);