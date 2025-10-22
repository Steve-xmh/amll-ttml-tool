// import { msToTimestamp } from "$/utils/timestamp.ts";
import { Card } from "@radix-ui/themes";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import HoverPlugin from "wavesurfer.js/dist/plugins/hover.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import {
	audioPlayingAtom,
	currentDurationAtom,
	currentTimeAtom,
} from "$/states/audio.ts";
import { audioEngine } from "$/utils/audio";
import { msToTimestamp } from "$/utils/timestamp";
import styles from "./audio-slider.module.css";

export const AudioSlider = () => {
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

		const ws = WaveSurfer.create({
			container: wsContainerRef.current,
			height,
			hideScrollbar: true,
			waveColor: primaryFillColor,
			progressColor: fontColor,
			cursorColor: fontColor,
			dragToSeek: true,
			cursorWidth: 0,
			barHeight: 0.8,
			plugins: [
				RegionsPlugin.create(),
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
		<Card
			style={{
				alignSelf: "center",
				width: "100%",
				height: "2.5em",
				padding: "0",
			}}
		>
			<div
				className={styles.waveformContainer}
				ref={wsContainerRef}
				style={{ width: "100%", height: "100%", overflow: "hidden" }}
			></div>
		</Card>
	);
};
