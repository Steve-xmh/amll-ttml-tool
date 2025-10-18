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
			plugins: [
				ZoomPlugin.create({
					// the amount of zoom per wheel step, e.g. 0.5 means a 50% magnification per scroll
					scale: 0.5,
					// Optionally, specify the maximum pixels-per-second factor while zooming
					maxZoom: 100,
				}),
				SpectrogramPlugin.create({
					// Display frequency labels on the left side
					labels: true,

					// Height of the spectrogram in pixels
					height: height * spectrogramHeightRatio,

					// Render separate spectrograms for each audio channel
					// Set to false to combine all channels into one spectrogram
					splitChannels: false,

					// Frequency scale type:
					// - 'linear': Standard linear frequency scale (0-20kHz)
					// - 'logarithmic': Logarithmic scale, better for low frequencies
					// - 'mel': Mel scale based on human hearing perception (default)
					// - 'bark': Bark scale for psychoacoustic analysis
					// - 'erb': ERB scale for auditory filter modeling
					scale: "mel",

					// Frequency range to display (in Hz)
					frequencyMax: 4000, // Maximum frequency to show
					frequencyMin: 0, // Minimum frequency to show

					// FFT parameters
					fftSamples: 1024, // Number of samples for FFT (must be power of 2)
					// Higher values = better frequency resolution, slower rendering

					// Visual styling
					labelsBackground: "transparent", // Background for frequency labels

					// Performance optimization
					useWebWorker: true, // Use web worker for FFT calculations (improves performance)

					// Additional options you can configure:
					//
					// Window function for FFT (affects frequency resolution vs time resolution):
					// windowFunc: 'hann' | 'hamming' | 'blackman' | 'bartlett' | 'cosine' | 'gauss' | 'lanczoz' | 'rectangular' | 'triangular'
					//
					// Color mapping for frequency intensity:
					colorMap: colorMap,
					//
					// Gain and range for color scaling:
					gainDB: 20,        // Brightness adjustment (default: 20dB)
					rangeDB: 70,       // Dynamic range (default: 80dB)
					//
					// Overlap between FFT windows:
					// noverlap: null,    // Auto-calculated by default, or set manually
					//
					// Maximum canvas width for performance:
					// maxCanvasWidth: 30000,  // Split large spectrograms into multiple canvases
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
