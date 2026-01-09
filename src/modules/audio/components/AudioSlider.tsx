import { Card } from "@radix-ui/themes";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { audioEngine } from "$/modules/audio/audio-engine";
import {
	audioBufferAtom,
	audioPlayingAtom,
	currentDurationAtom,
	currentTimeAtom,
} from "$/modules/audio/states";
import {
	spectrogramContainerWidthAtom,
	spectrogramScrollLeftAtom,
	spectrogramZoomAtom,
} from "$/modules/spectrogram/states";
import { lyricLinesAtom, selectedLinesAtom } from "$/states/main";
import { msToTimestamp } from "$/utils/timestamp";
import styles from "./AudioSlider.module.css";

const clampZoom = (z: number) => Math.max(50, Math.min(z, 1000));
const clampScroll = (
	s: number,
	currentZoom: number,
	totalDurationMs: number,
	containerWidthPx: number,
) => {
	if (totalDurationMs <= 0) return 0;
	const durationS = totalDurationMs / 1000;
	const totalWidth = durationS * currentZoom;
	const maxScroll = Math.max(0, totalWidth - containerWidthPx);
	return Math.max(0, Math.min(s, maxScroll));
};

export const AudioSlider = () => {
	const setCurrentTime = useSetAtom(currentTimeAtom);
	const setCurrentDuration = useSetAtom(currentDurationAtom);
	const setAudioPlaying = useSetAtom(audioPlayingAtom);

	const [zoom, setZoom] = useAtom(spectrogramZoomAtom);
	const [scrollLeft, setScrollLeft] = useAtom(spectrogramScrollLeftAtom);
	const containerWidth = useAtomValue(spectrogramContainerWidthAtom);
	const currentDuration = useAtomValue(currentDurationAtom);
	const lyricLines = useAtomValue(lyricLinesAtom);
	const selectedLines = useAtomValue(selectedLinesAtom);
	const audioBuffer = useAtomValue(audioBufferAtom);
	const [hoverState, setHoverState] = useState({
		x: 0,
		timeStr: "0:00",
		isNearRight: false,
		isVisible: false,
	});

	const wsContainerRef = useRef<HTMLDivElement>(null);
	const waveSurferRef = useRef<WaveSurfer | null>(null);

	const [sliderWidthPx, setSliderWidthPx] = useState(0);

	const dragStateRef = useRef<{
		type: "drag" | "resizeLeft" | "resizeRight";
		initialMouseX: number;
		initialScrollLeft: number;
		startTimeMs: number;
		endTimeMs: number;
		timePerPixelOnSlider: number;
	} | null>(null);

	const destroyWaveSurfer = useCallback(() => {
		if (waveSurferRef.current) {
			waveSurferRef.current.destroy();
			waveSurferRef.current = null;
		}
	}, []);

	const createWaveSurfer = useCallback(() => {
		if (!wsContainerRef.current || !audioBuffer) {
			return null;
		}
		const height = wsContainerRef.current.clientHeight;
		const canvasStyles = getComputedStyle(wsContainerRef.current);
		const fontColor =
			canvasStyles.getPropertyValue("--accent-a11") || "#00ffa21e";
		const primaryFillColor =
			canvasStyles.getPropertyValue("--accent-a4") || "#00ffa21e";

		const peaks = [audioBuffer.getChannelData(0)];
		const duration = audioBuffer.duration;

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
			media: audioEngine.audioEl,
			peaks: peaks,
			duration: duration,
		});
		waveSurferRef.current = ws;
		return ws;
	}, [audioBuffer]);

	useEffect(() => {
		const container = wsContainerRef.current;
		if (!container) return;

		const observer = new ResizeObserver((entries) => {
			if (entries[0]) {
				setSliderWidthPx(entries[0].contentRect.width);
			}
		});
		observer.observe(container);
		setSliderWidthPx(container.clientWidth);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (audioBuffer && audioEngine.audioEl) {
			destroyWaveSurfer();
			setCurrentDuration((audioBuffer.duration * 1000) | 0);
			createWaveSurfer();
		}
	}, [audioBuffer, createWaveSurfer, destroyWaveSurfer, setCurrentDuration]);

	useEffect(() => {
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

		audioEngine.addEventListener("music-unload", handleMusicUnload);
		audioEngine.addEventListener("music-resume", handlePlay);
		audioEngine.addEventListener("music-pause", handlePause);
		audioEngine.addEventListener("music-seeked", handleSeek);

		return () => {
			destroyWaveSurfer();
			audioEngine.removeEventListener("music-unload", handleMusicUnload);
			audioEngine.removeEventListener("music-resume", handlePlay);
			audioEngine.removeEventListener("music-pause", handlePause);
			audioEngine.removeEventListener("music-seeked", handleSeek);
		};
	}, [destroyWaveSurfer, setCurrentDuration, setCurrentTime, setAudioPlaying]);

	const handleDragMove = useCallback(
		(event: MouseEvent) => {
			if (
				!dragStateRef.current ||
				currentDuration <= 0 ||
				!wsContainerRef.current
			)
				return;

			const {
				type,
				initialMouseX,
				initialScrollLeft,
				startTimeMs,
				endTimeMs,
				timePerPixelOnSlider,
			} = dragStateRef.current;

			const sliderLeftPx = wsContainerRef.current.getBoundingClientRect().left;
			const mouseXPx_relative = Math.max(0, event.clientX - sliderLeftPx);

			if (type === "drag") {
				const deltaXPx = event.clientX - initialMouseX;
				const deltaTMs = deltaXPx * timePerPixelOnSlider;
				const deltaScrollPx = (deltaTMs / 1000) * zoom;
				const newScrollLeft = initialScrollLeft + deltaScrollPx;
				setScrollLeft(
					clampScroll(newScrollLeft, zoom, currentDuration, containerWidth),
				);
			} else if (type === "resizeRight") {
				const startTimeS = startTimeMs / 1000;
				const newEndTimeMs = mouseXPx_relative * timePerPixelOnSlider;
				const newViewDurationMs = newEndTimeMs - startTimeMs;
				if (newViewDurationMs <= 0) return;

				const newZoom = clampZoom(containerWidth / (newViewDurationMs / 1000));
				const newScrollLeft = clampScroll(
					startTimeS * newZoom,
					newZoom,
					currentDuration,
					containerWidth,
				);

				setZoom(newZoom);
				setScrollLeft(newScrollLeft);
			} else if (type === "resizeLeft") {
				const endTimeS = endTimeMs / 1000;
				const newStartTimeMs = mouseXPx_relative * timePerPixelOnSlider;
				const newViewDurationMs = endTimeMs - newStartTimeMs;
				if (newViewDurationMs <= 0) return;

				const newZoom = clampZoom(containerWidth / (newViewDurationMs / 1000));
				const newViewDurationS = containerWidth / newZoom;
				const newStartTimeS = endTimeS - newViewDurationS;

				const newScrollLeft = clampScroll(
					newStartTimeS * newZoom,
					newZoom,
					currentDuration,
					containerWidth,
				);
				setZoom(newZoom);
				setScrollLeft(newScrollLeft);
			}
		},
		[containerWidth, currentDuration, setScrollLeft, setZoom, zoom],
	);

	const handleDragEnd = useCallback(() => {
		dragStateRef.current = null;
		window.removeEventListener("mousemove", handleDragMove);
		window.removeEventListener("mouseup", handleDragEnd);
	}, [handleDragMove]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (currentDuration <= 0 || sliderWidthPx <= 0 || !wsContainerRef.current)
				return;

			const type = e.currentTarget.dataset.dragType as
				| "drag"
				| "resizeLeft"
				| "resizeRight";

			if (!type) return;

			const timePerPixelOnSlider = currentDuration / sliderWidthPx;
			const startTimeMs = (scrollLeft / zoom) * 1000;
			const endTimeMs = ((scrollLeft + containerWidth) / zoom) * 1000;

			dragStateRef.current = {
				type,
				initialMouseX: e.clientX,
				initialScrollLeft: scrollLeft,
				startTimeMs,
				endTimeMs,
				timePerPixelOnSlider,
			};

			window.addEventListener("mousemove", handleDragMove);
			window.addEventListener("mouseup", handleDragEnd, { once: true });
		},
		[
			currentDuration,
			sliderWidthPx,
			scrollLeft,
			zoom,
			containerWidth,
			handleDragMove,
			handleDragEnd,
		],
	);

	const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (dragStateRef.current || currentDuration <= 0 || sliderWidthPx <= 0) {
			setHoverState((prev) => ({ ...prev, isVisible: false }));
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const clampedX = Math.max(0, Math.min(x, rect.width));

		const isNearRight = rect.width - clampedX < 80;

		const progress = clampedX / rect.width;
		const timeMs = progress * currentDuration;

		setHoverState({
			x: clampedX,
			timeStr: msToTimestamp(timeMs),
			isNearRight,
			isVisible: true,
		});
	};

	const handleContainerMouseLeave = () => {
		setHoverState((prev) => ({ ...prev, isVisible: false }));
	};

	const selectedRegions = useMemo(() => {
		if (currentDuration <= 0 || sliderWidthPx <= 0) return [];

		const pixelsPerMs = sliderWidthPx / currentDuration;
		const regions: { id: string; left: number; width: number }[] = [];

		for (const line of lyricLines.lyricLines) {
			if (selectedLines.has(line.id)) {
				const left = line.startTime * pixelsPerMs;
				const width = (line.endTime - line.startTime) * pixelsPerMs;
				regions.push({ id: line.id, left, width });
			}
		}
		return regions;
	}, [lyricLines.lyricLines, selectedLines, currentDuration, sliderWidthPx]);

	const audioLoaded = currentDuration > 0 && sliderWidthPx > 0;
	let rectLeftPx = 0;
	let rectWidthPx = 0;

	const startTimeMs = 0;
	const viewDurationMs = 0;
	const durationS = currentDuration / 1000;

	const startTimeS = startTimeMs / 1000;
	const endTimeS = (startTimeMs + viewDurationMs) / 1000;

	if (audioLoaded) {
		const pixelsPerMsOnSlider = sliderWidthPx / currentDuration;
		const startTimeMs = (scrollLeft / zoom) * 1000;
		const viewDurationMs = (containerWidth / zoom) * 1000;
		rectLeftPx = startTimeMs * pixelsPerMsOnSlider;
		rectWidthPx = viewDurationMs * pixelsPerMsOnSlider;
	}

	return (
		<Card
			style={{
				alignSelf: "center",
				width: "100%",
				height: "2.5em",
				padding: "0",
			}}
		>
			<section
				className={styles.waveformContainer}
				aria-label="Audio Waveform"
				ref={wsContainerRef}
				style={{ width: "100%", height: "100%", overflow: "hidden" }}
				onMouseMove={handleContainerMouseMove}
				onMouseLeave={handleContainerMouseLeave}
			>
				{hoverState && (
					<div
						className={`${styles.hoverGuide} ${
							hoverState.isVisible ? styles.hoverGuideVisible : ""
						}`}
						style={{ left: hoverState.x }}
					>
						<div
							className={`${styles.timeLabel} ${
								hoverState.isNearRight ? styles.labelRight : styles.labelLeft
							}`}
						>
							{hoverState.timeStr}
						</div>
					</div>
				)}
				{selectedRegions.map((region) => (
					<div
						key={region.id}
						className={styles.selectedLyricRegion}
						style={{
							left: `${region.left}px`,
							width: `${region.width}px`,
						}}
					/>
				))}
				{audioLoaded && rectWidthPx > 0 && (
					<div
						className={styles.spectrogramRegion}
						style={{
							left: `${rectLeftPx}px`,
							width: `${rectWidthPx}px`,
						}}
					>
						<div
							role="slider"
							data-drag-type="resizeLeft"
							className={`${styles.regionHandle} ${styles.regionHandleLeft}`}
							onMouseDown={handleMouseDown}
							tabIndex={0}
							aria-valuenow={startTimeS}
							aria-valuemin={0}
							aria-valuemax={durationS}
							aria-valuetext={msToTimestamp(startTimeMs)}
						/>
						<div
							role="slider"
							data-drag-type="drag"
							className={styles.regionBody}
							onMouseDown={handleMouseDown}
							tabIndex={0}
							aria-valuenow={startTimeS}
							aria-valuemin={0}
							aria-valuemax={durationS}
							aria-valuetext={msToTimestamp(startTimeMs)}
						/>
						<div
							role="slider"
							data-drag-type="resizeRight"
							className={`${styles.regionHandle} ${styles.regionHandleRight}`}
							onMouseDown={handleMouseDown}
							tabIndex={0}
							aria-valuenow={endTimeS}
							aria-valuemin={0}
							aria-valuemax={durationS}
							aria-valuetext={msToTimestamp(startTimeMs + viewDurationMs)}
						/>
					</div>
				)}
			</section>
		</Card>
	);
};
