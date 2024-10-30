/*
 * Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { Card, Flex, IconButton, Inset, Text, Tooltip } from "@radix-ui/themes";
import MusicNote216Filled from "@ricons/fluent/MusicNote216Filled";
import Pause16Filled from "@ricons/fluent/Pause16Filled";
import Play16Filled from "@ricons/fluent/Play16Filled";
import { Icon } from "@ricons/utils";
import { useAtom, useAtomValue } from "jotai";
import {
	type FC,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	audioPlayingAtom,
	currentDurationAtom,
	currentTimeAtom,
	loadableAudioWaveformAtom,
	loadedAudioAtom,
} from "../../states/main";
import { msToTimestamp } from "../../utils/timestamp";

export const AudioControls: FC = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
	const cachedWaveformRef = useRef<ImageData>();
	const mouseSeekPosRef = useRef(Number.NaN);
	const [audio, setAudio] = useAtom(loadedAudioAtom);
	const [audioLoaded, setAudioLoaded] = useState(false);
	const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
	const [currentDuration, setCurrentDuration] = useAtom(currentDurationAtom);
	const [audioPlaying, setAudioPlaying] = useAtom(audioPlayingAtom);
	const waveform = useAtomValue(loadableAudioWaveformAtom);

	const onLoadMusic = () => {
		const inputEl = document.createElement("input");
		inputEl.type = "file";
		inputEl.accept = "audio/*,*/*";
		inputEl.addEventListener(
			"change",
			() => {
				const file = inputEl.files?.[0];
				const audioEl = audioRef.current;
				if (file && audioEl) {
					console.log("Loading audio", file);
					setAudio(file);
				}
			},
			{
				once: true,
			},
		);
		inputEl.click();
	};

	const onTogglePlay = () => {
		const audioEl = audioRef.current;
		if (!audioEl) return;
		if (audioEl.paused) audioEl.play();
		else audioEl.pause();
	};

	const redrawCachedWaveform = useCallback(() => {
		const audioEl = audioRef.current;
		if (!audioEl) return;
		const canvas = waveformCanvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
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
	}, []);

	const redrawWaveform = useCallback(
		(waveform: Float32Array) => {
			const canvas = waveformCanvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const canvasStyles = getComputedStyle(canvas);
			const secondaryFillColor =
				canvasStyles.getPropertyValue("--accent-a4") || "#00ffa21e";
			ctx.strokeStyle = secondaryFillColor;
			ctx.lineJoin = "round";
			ctx.lineWidth = 1;
			const canvasHeightHalf = canvas.height / 2;

			ctx.beginPath();
			for (let x = 0; x < canvas.width; x++) {
				const wx = (x / canvas.width) * waveform.length;
				const wxL = Math.max(0, Math.floor(wx));
				const wxH = Math.min(waveform.length, Math.ceil(wx));
				const lerp = wx % 1;
				const y =
					((waveform[wxH] - waveform[wxL]) * lerp + waveform[wxL]) *
					canvasHeightHalf;
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

	useEffect(() => {
		const audioEl = audioRef.current;
		if (audioEl && audio.size > 0) {
			const audioUrl = URL.createObjectURL(audio);
			audioEl.src = audioUrl;
			setAudioLoaded(true);
			return () => {
				audioEl.src = "";
				URL.revokeObjectURL(audioUrl);
				setAudioLoaded(false);
			};
		}
	}, [audio]);

	useLayoutEffect(() => {
		const audioEl = audioRef.current;
		if (!audioEl) return;
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
			console.log(audioEl.duration);
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
		<Card m="2" mt="0">
			{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
			<audio ref={audioRef} style={{ display: "none" }} />
			<Inset>
				<Flex align="center" px="2" gapX="2">
					<Tooltip content="加载音乐">
						<IconButton my="2" variant="soft" onClick={onLoadMusic}>
							<Icon>
								<MusicNote216Filled />
							</Icon>
						</IconButton>
					</Tooltip>
					<Tooltip content="暂停 / 播放音乐">
						<IconButton
							my="2"
							ml="0"
							variant="soft"
							disabled={!audioLoaded}
							onClick={onTogglePlay}
						>
							<Icon>{audioPlaying ? <Pause16Filled /> : <Play16Filled />}</Icon>
						</IconButton>
					</Tooltip>
					<Text
						size="2"
						style={{
							minWidth: "5em",
							textAlign: "right",
						}}
					>
						{msToTimestamp(currentTime)}
					</Text>
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
								mouseSeekPosRef.current =
									(evt.clientX - rect.left) / rect.width;
								redrawCachedWaveform();
							}}
							onMouseLeave={() => {
								mouseSeekPosRef.current = Number.NaN;
								redrawCachedWaveform();
							}}
							onClick={() => {
								const audioEl = audioRef.current;
								const mouseSeekPos = mouseSeekPosRef.current;
								if (!Number.isNaN(mouseSeekPos) && audioEl) {
									audioEl.currentTime = mouseSeekPos * audioEl.duration;
									redrawCachedWaveform();
								}
							}}
						/>
					</Card>
					<Text
						size="2"
						style={{
							minWidth: "5em",
						}}
					>
						{msToTimestamp(currentDuration)}
					</Text>
				</Flex>
			</Inset>
		</Card>
	);
};

export default AudioControls;
