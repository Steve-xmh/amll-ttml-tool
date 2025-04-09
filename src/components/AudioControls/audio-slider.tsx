import {
	audioPlayingAtom,
	currentDurationAtom,
	currentTimeAtom,
} from "$/states/audio.ts";
import { audioEngine } from "$/utils/audio";
import { msToTimestamp } from "$/utils/timestamp.ts";
import { Card } from "@radix-ui/themes";
import { useSetAtom } from "jotai";
import { useCallback, useLayoutEffect, useRef } from "react";

export const AudioSlider = () => {
	const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
	const cachedWaveformRef = useRef<ImageData>(null);
	const mouseSeekPosRef = useRef(Number.NaN);
	const isPressingRef = useRef(false);

	const setCurrentTime = useSetAtom(currentTimeAtom);
	const setCurrentDuration = useSetAtom(currentDurationAtom);
	const setAudioPlaying = useSetAtom(audioPlayingAtom);

	const redrawCachedWaveform = useCallback(() => {
		const canvas = waveformCanvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d", {
			willReadFrequently: true,
		});
		if (!ctx) return;
		const p = audioEngine.musicCurrentTime / audioEngine.musicDuration;
		const playWidth = canvas.width * p;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const canvasStyles = getComputedStyle(canvas);
		const fontFillColor =
			canvasStyles.getPropertyValue("--accent-a11") || "#00ffa21e";
		const primaryFillColor =
			canvasStyles.getPropertyValue("--accent-a4") || "#00ffa21e";
		const fontSize = canvasStyles.getPropertyValue("--font-size-2");
		if (cachedWaveformRef.current) {
			ctx.globalCompositeOperation = "source-over";
			ctx.putImageData(cachedWaveformRef.current, 0, 0);
		}
		// ctx.globalCompositeOperation = "source-in";
		ctx.fillStyle = primaryFillColor;
		ctx.fillRect(0, 0, playWidth, canvas.height);
		const mouseSeekPos = mouseSeekPosRef.current;
		if (!Number.isNaN(mouseSeekPos)) {
			const mouseSeekWidth = mouseSeekPos * canvas.width;
			ctx.globalCompositeOperation = "source-over";
			const seekTimestamp = msToTimestamp(
				(mouseSeekPos * audioEngine.musicDuration * 1000) | 0,
			);
			const size = ctx.measureText(seekTimestamp);
			ctx.font = `calc(${fontSize} * ${devicePixelRatio}) ${canvasStyles.fontFamily}`;
			ctx.strokeStyle = fontFillColor;
			ctx.fillStyle = fontFillColor;
			ctx.lineWidth = devicePixelRatio;
			const padding = devicePixelRatio * 8;
			let targetPos = mouseSeekWidth + padding;
			if (targetPos > canvas.width - size.width - padding) {
				targetPos = mouseSeekWidth - size.width - padding;
			}
			ctx.fillText(
				seekTimestamp,
				targetPos,
				canvas.height / 2 +
					(size.actualBoundingBoxAscent - size.actualBoundingBoxDescent) / 2,
			);
			ctx.beginPath();
			ctx.moveTo(mouseSeekWidth, 0);
			ctx.lineTo(mouseSeekWidth, canvas.height);
			ctx.stroke();
		}
	}, []);

	const redrawWaveform = useCallback(
		(waveform: Float32Array) => {
			const canvas = waveformCanvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d", {
				willReadFrequently: true,
			});
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const canvasStyles = getComputedStyle(canvas);
			ctx.strokeStyle =
				canvasStyles.getPropertyValue("--accent-a4") || "#00ffa21e";
			ctx.lineJoin = "round";
			ctx.lineWidth = 1;
			const canvasHeightHalf = canvas.height / 2;
			const samplePerPixel = waveform.length / canvas.width;

			ctx.beginPath();
			let sampleIndex = 0;
			for (let x = 0; x < canvas.width; x++) {
				let sumTime = 0;
				let sum = 0;
				while (
					sampleIndex < samplePerPixel * (x + 1) &&
					sampleIndex < waveform.length
				) {
					sum += Math.abs(waveform[sampleIndex]);
					sampleIndex += 16;
					sumTime++;
				}
				const y = (sum / sumTime) * canvas.height;
				ctx.moveTo(x, canvasHeightHalf - y);
				ctx.lineTo(x, canvasHeightHalf + y);
			}
			ctx.stroke();
			cachedWaveformRef.current = ctx.getImageData(
				0,
				0,
				canvas.width,
				canvas.height,
			);
			redrawCachedWaveform();
		},
		[redrawCachedWaveform],
	);

	useLayoutEffect(() => {
		let frame = 0;
		const onFrame = () => {
			if (!audioEngine.musicPlaying) {
				cancelAnimationFrame(frame);
				frame = 0;
				return;
			}
			redrawCachedWaveform();
			setCurrentTime((audioEngine.musicCurrentTime * 1000) | 0);
			frame = requestAnimationFrame(onFrame);
		};
		const onLoad = () => {
			setCurrentDuration((audioEngine.musicDuration * 1000) | 0);
		};
		const onPlay = () => {
			setAudioPlaying(true);
			onFrame();
		};
		const onPause = () => {
			setAudioPlaying(false);
			setCurrentTime((audioEngine.musicCurrentTime * 1000) | 0);
			if (frame !== 0) {
				cancelAnimationFrame(frame);
				frame = 0;
			}
		};
		const onSeeked = () => {
			setCurrentTime((audioEngine.musicCurrentTime * 1000) | 0);
			redrawCachedWaveform();
		};
		audioEngine.addEventListener("music-load", onLoad);
		audioEngine.addEventListener("music-resume", onPlay);
		audioEngine.addEventListener("music-pause", onPause);
		audioEngine.addEventListener("music-seeked", onSeeked);
		setAudioPlaying(audioEngine.musicPlaying);

		return () => {
			audioEngine.removeEventListener("music-load", onLoad);
			audioEngine.removeEventListener("music-resume", onPlay);
			audioEngine.removeEventListener("music-pause", onPause);
			audioEngine.removeEventListener("music-seeked", onSeeked);
		};
	}, [
		setAudioPlaying,
		setCurrentDuration,
		setCurrentTime,
		redrawCachedWaveform,
	]);

	useLayoutEffect(() => {
		const onMusicUnload = () => {
			redrawWaveform(new Float32Array(0));
		};
		const onMusicLoad = () => {
			redrawWaveform(audioEngine.musicWaveform);
		};
		audioEngine.addEventListener("music-unload", onMusicUnload);
		audioEngine.addEventListener("music-load", onMusicLoad);

		return () => {
			audioEngine.removeEventListener("music-unload", onMusicUnload);
			audioEngine.removeEventListener("music-load", onMusicLoad);
		};
	}, [redrawWaveform]);

	useLayoutEffect(() => {
		const canvas = waveformCanvasRef.current;
		if (!canvas) return;
		const obs = new ResizeObserver((entries) => {
			canvas.width = entries[0].contentRect.width * devicePixelRatio;
			canvas.height = entries[0].contentRect.height * devicePixelRatio;
			redrawWaveform(audioEngine.musicWaveform);
		});
		obs.observe(canvas);
		return () => {
			obs.disconnect();
		};
	}, [redrawWaveform]);

	const onTrySeekMusicWhenDragging = useCallback(() => {
		const mouseSeekPos = mouseSeekPosRef.current;
		if (!Number.isNaN(mouseSeekPos)) {
			audioEngine.seekMusic(
				Math.max(0, mouseSeekPos * audioEngine.musicDuration),
			);
			redrawCachedWaveform();
		}
	}, [redrawCachedWaveform]);

	return (
		<Card
			style={{
				alignSelf: "center",
				width: "100%",
				height: "2.5em",
				padding: "0",
			}}
		>
			<canvas
				style={{
					width: "100%",
					height: "100%",
					cursor: "text",
				}}
				ref={waveformCanvasRef}
				onMouseMove={(evt) => {
					const rect = evt.currentTarget.getBoundingClientRect();
					mouseSeekPosRef.current = (evt.clientX - rect.left) / rect.width;
					// if (isPressingRef.current) onTrySeekMusicWhenDragging();
					redrawCachedWaveform();
				}}
				onMouseLeave={() => {
					mouseSeekPosRef.current = Number.NaN;
					isPressingRef.current = false;
					redrawCachedWaveform();
				}}
				onTouchStart={(evt) => {
					const rect = evt.currentTarget.getBoundingClientRect();
					mouseSeekPosRef.current =
						(evt.touches[0].clientX - rect.left) / rect.width;
					isPressingRef.current = true;
					onTrySeekMusicWhenDragging();
					redrawCachedWaveform();
				}}
				onTouchMove={(evt) => {
					const rect = evt.currentTarget.getBoundingClientRect();
					mouseSeekPosRef.current =
						(evt.touches[0].clientX - rect.left) / rect.width;
					// if (isPressingRef.current) onTrySeekMusicWhenDragging();
					redrawCachedWaveform();
				}}
				onTouchEnd={() => {
					isPressingRef.current = false;
					// onTrySeekMusicWhenDragging();
					mouseSeekPosRef.current = Number.NaN;
				}}
				onMouseDown={() => {
					isPressingRef.current = true;
					onTrySeekMusicWhenDragging();
				}}
				onMouseUp={() => {
					isPressingRef.current = false;
					// onTrySeekMusicWhenDragging();
				}}
			/>
		</Card>
	);
};
