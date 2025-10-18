import {
	audioPlayingAtom,
	currentDurationAtom,
	currentTimeAtom,
} from "$/states/audio.ts";
import { audioEngine } from "$/utils/audio";
// import { msToTimestamp } from "$/utils/timestamp.ts";
import { Text } from "@radix-ui/themes";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import HoverPlugin from "wavesurfer.js/dist/plugins/hover.esm.js";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";
import styles from "./audio-spectrogram.module.css";
import { msToTimestamp } from "$/utils/timestamp";
import colorMap from "./colorMap.json";

export const AudioSpectrogram = () => {
	const setCurrentTime = useSetAtom(currentTimeAtom);
	const setCurrentDuration = useSetAtom(currentDurationAtom);
	const setAudioPlaying = useSetAtom(audioPlayingAtom);

	const wsContainerRef = useRef<HTMLDivElement>(null);
	const waveSurferRef = useRef<WaveSurfer | null>(null);

	const destroyWaveSurfer = useCallback(() => {
		if (waveSurferRef.current) {
			waveSurferRef.current.destroy();
			waveSurferRef.current = null;
		}
	}, []);

	const createWaveSurfer = useCallback(() => {
		if (!wsContainerRef.current || !audioEngine.audioEl) {
			return null;
		}
		const height = wsContainerRef.current.clientHeight;
		const canvasStyles = getComputedStyle(wsContainerRef.current);
		const fontColor =
			canvasStyles.getPropertyValue("--accent-a11") || "#00ffa21e";
		const fontSize = canvasStyles.getPropertyValue("--font-size-2") || "14px";
		const primaryFillColor =
			canvasStyles.getPropertyValue("--accent-a4") || "#00ffa21e";

		const spectrogramHeightRatio = 0.8;

		const ws = WaveSurfer.create({
			container: wsContainerRef.current,
			height: height * (1 - spectrogramHeightRatio),
			waveColor: primaryFillColor,
			progressColor: fontColor,
			cursorColor: fontColor,
			dragToSeek: true,
			normalize: true,
			cursorWidth: 0,
			barHeight: 0.8,
			sampleRate: 44100,
			plugins: [
				ZoomPlugin.create({
					// the amount of zoom per wheel step, e.g. 0.5 means a 50% magnification per scroll
					scale: 0.3,
					// Optionally, specify the maximum pixels-per-second factor while zooming
					maxZoom: 200,
				}),
				SpectrogramPlugin.create({
					labels: false,
					height: height * spectrogramHeightRatio,
					colorMap,
					fftSamples: 1024,
					noverlap: 512,
					frequencyMin: 100,
					frequencyMax: 22050,
					scale: "linear",
					gainDB: 20,
					rangeDB: 80,
					windowFunc: "hann",
				}),
				HoverPlugin.create({
					formatTimeCallback: (v) => msToTimestamp(Math.round(v * 1000)),
					lineColor: fontColor,
					lineWidth: 1,
					labelBackground: "#transparent",
					labelColor: fontColor,
					labelSize: fontSize,
					labelPreferLeft: false,
				}),
			],
			media: audioEngine.audioEl,
		});
		waveSurferRef.current = ws;
		return ws;
	}, []);

	useEffect(() => {
		const handleMusicLoad = () => {
			destroyWaveSurfer();
			setCurrentDuration((audioEngine.musicDuration * 1000) | 0);
			setCurrentTime((audioEngine.musicCurrentTime * 1000) | 0);
			createWaveSurfer();
		};

		const handleMusicUnload = () => {
			destroyWaveSurfer();
			setCurrentDuration(0);
			setCurrentTime(0);
			setAudioPlaying(false);
		};

		let frame = 0;
		const onFrame = () => {
			if (!audioEngine.musicPlaying) {
				cancelAnimationFrame(frame);
				frame = 0;
				return;
			}
			setCurrentTime((audioEngine.musicCurrentTime * 1000) | 0);
			frame = requestAnimationFrame(onFrame);
		};

		const handlePlay = () => {
			onFrame();
			setAudioPlaying(true);
		};
		const handlePause = () => setAudioPlaying(false);
		const handleSeek = () =>
			setCurrentTime((audioEngine.musicCurrentTime * 1000) | 0);

		if (audioEngine.musicLoaded) handleMusicLoad();
		audioEngine.addEventListener("music-load", handleMusicLoad);
		audioEngine.addEventListener("music-unload", handleMusicUnload);
		audioEngine.addEventListener("music-resume", handlePlay);
		audioEngine.addEventListener("music-pause", handlePause);
		audioEngine.addEventListener("music-seeked", handleSeek);

		return () => {
			destroyWaveSurfer();
			audioEngine.removeEventListener("music-load", handleMusicLoad);
			audioEngine.removeEventListener("music-unload", handleMusicUnload);
			audioEngine.removeEventListener("music-resume", handlePlay);
			audioEngine.removeEventListener("music-pause", handlePause);
			audioEngine.removeEventListener("music-seeked", handleSeek);
		};
	}, [
		createWaveSurfer,
		destroyWaveSurfer,
		setCurrentDuration,
		setCurrentTime,
		setAudioPlaying,
	]);

	return (
		<div
			style={{
				alignSelf: "center",
				height: "12.5rem",
				width: "100%",
				padding: "0",
				position: "relative",
			}}
		>
			<div className={styles.loadingTip}>
				<Text color="gray">等待频谱图装载…</Text>
			</div>
			<div
				className={styles.spectrogramContainer}
				ref={wsContainerRef}
				style={{ width: "100%", height: "100%", overflow: "hidden" }}
			></div>
		</div>
	);
};
