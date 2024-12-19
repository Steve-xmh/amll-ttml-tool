import { genWaveform } from "$/utils/gen-waveform.ts";
import { atom } from "jotai/index";
import { atomWithStorage, loadable } from "jotai/utils";
import { toast } from "react-toastify";

export const audioElAtom = atom<HTMLAudioElement>(
	document.createElement("audio"),
);
export const volumeAtom = atomWithStorage("volume", 0.5);
export const playbackRateAtom = atomWithStorage("playbackRate", 1);
export const audioPlayingAtom = atom(false);
export const loadedAudioAtom = atom(new Blob([]));
export const currentTimeAtom = atom(0);
export const currentDurationAtom = atom(0);
export const audioWaveformAtom = atom(async (get) => {
	const audio = get(loadedAudioAtom);
	if (audio.size > 1024 * 1024 * 64) {
		toast.warn("音频文件超过 64MB，为避免卡顿已跳过波形图生成");
		return new Float32Array();
	}
	const tid = toast.loading("正在生成音频波形图...");
	try {
		const [waveform] = await genWaveform(audio);
		return waveform;
	} finally {
		toast.done(tid);
	}
});

export const loadableAudioWaveformAtom = loadable(audioWaveformAtom);
