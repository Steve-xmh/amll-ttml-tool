import { audioElAtom } from "$/states/audio.ts";
import {
	audioPlayingAtom,
	currentDurationAtom,
	currentTimeAtom,
	loadableAudioWaveformAtom,
} from "$/states/main.ts";
import { msToTimestamp } from "$/utils/timestamp.ts";
import { Card } from "@radix-ui/themes";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useLayoutEffect, useRef } from "react";

export const AudioSlider = () => {
	const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
	const cachedWaveformRef = useRef<ImageData>(null);
	const waveform = useAtomValue(loadableAudioWaveformAtom);
	const mouseSeekPosRef = useRef(Number.NaN);
	const audioEl = useAtomValue(audioElAtom);

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
		const p = audioEl.currentTime / audioEl.duration;
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
				(mouseSeekPos * audioEl.duration * 1000) | 0,
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
	}, [audioEl]);

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
			if (audioEl.paused) {
				cancelAnimationFrame(frame);
				frame = 0;
				return;
			}
			redrawCachedWaveform();
			setCurrentTime((audioEl.currentTime * 1000) | 0);
			frame = requestAnimationFrame(onFrame);
		};
		const onLoad = () => {
			console.log("Music Duration", audioEl.duration);
			setCurrentDuration((audioEl.duration * 1000) | 0);
		};
		const onPlay = () => {
			setAudioPlaying(true);
			onFrame();
		};
		const onPause = () => {
			setAudioPlaying(false);
			setCurrentTime((audioEl.currentTime * 1000) | 0);
			if (frame !== 0) {
				cancelAnimationFrame(frame);
				frame = 0;
			}
		};
		const onSeeked = () => {
			setCurrentTime((audioEl.currentTime * 1000) | 0);
		};
		audioEl.addEventListener("loadedmetadata", onLoad);
		audioEl.addEventListener("play", onPlay);
		audioEl.addEventListener("pause", onPause);
		audioEl.addEventListener("seeked", onSeeked);
		setAudioPlaying(!audioEl.paused);

		return () => {
			audioEl.removeEventListener("loadedmetadata", onLoad);
			audioEl.removeEventListener("play", onPlay);
			audioEl.removeEventListener("pause", onPause);
			audioEl.removeEventListener("seeked", onSeeked);
		};
	}, [
		audioEl,
		setAudioPlaying,
		setCurrentDuration,
		setCurrentTime,
		redrawCachedWaveform,
	]);

	useLayoutEffect(() => {
		if (waveform.state !== "hasData") return;
		redrawWaveform(waveform.data);
	}, [redrawWaveform, waveform]);

	useLayoutEffect(() => {
		const canvas = waveformCanvasRef.current;
		if (!canvas) return;
		const obs = new ResizeObserver((entries) => {
			canvas.width = entries[0].contentRect.width * devicePixelRatio;
			canvas.height = entries[0].contentRect.height * devicePixelRatio;
			if (waveform.state !== "hasData") return;
			redrawWaveform(waveform.data);
		});
		obs.observe(canvas);
		return () => {
			obs.disconnect();
		};
	}, [redrawWaveform, waveform]);

	return (
		<Card
			style={{
				alignSelf: "center",
				width: "100%",
				height: "2.5em",
				padding: "0",
			}}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
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
					redrawCachedWaveform();
				}}
				onMouseLeave={() => {
					mouseSeekPosRef.current = Number.NaN;
					redrawCachedWaveform();
				}}
				onTouchStart={(evt) => {
					const rect = evt.currentTarget.getBoundingClientRect();
					mouseSeekPosRef.current =
						(evt.touches[0].clientX - rect.left) / rect.width;
					redrawCachedWaveform();
				}}
				onTouchMove={(evt) => {
					const rect = evt.currentTarget.getBoundingClientRect();
					mouseSeekPosRef.current =
						(evt.touches[0].clientX - rect.left) / rect.width;
					redrawCachedWaveform();
				}}
				onTouchEnd={() => {
					const mouseSeekPos = mouseSeekPosRef.current;
					if (!Number.isNaN(mouseSeekPos) && audioEl) {
						audioEl.currentTime = mouseSeekPos * audioEl.duration;
						mouseSeekPosRef.current = Number.NaN;
						redrawCachedWaveform();
					}
				}}
				onClick={() => {
					const mouseSeekPos = mouseSeekPosRef.current;
					if (!Number.isNaN(mouseSeekPos) && audioEl) {
						audioEl.currentTime = mouseSeekPos * audioEl.duration;
						redrawCachedWaveform();
					}
				}}
			/>
		</Card>
	);
};
