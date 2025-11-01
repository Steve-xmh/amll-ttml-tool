import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { msToTimestamp } from "$/utils/timestamp";

const RULER_HEIGHT = 24;

interface TimelineRulerProps {
	zoom: number;
	duration: number;
	containerWidth: number;
}

export interface TimelineRulerHandle {
	draw: (scrollLeft: number) => void;
}

const TICK_INTERVALS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

function getTickInterval(zoom: number) {
	const minPxPerTick = 50;
	const minSecondsPerTick = minPxPerTick / zoom;
	const majorInterval =
		TICK_INTERVALS.find((i) => i >= minSecondsPerTick) ||
		TICK_INTERVALS[TICK_INTERVALS.length - 1];
	return {
		major: majorInterval,
		minor: majorInterval / (majorInterval > 2 ? 5 : 2),
	};
}

export const TimelineRuler = forwardRef<
	TimelineRulerHandle,
	TimelineRulerProps
>(({ zoom, duration, containerWidth }, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const lastScrollLeft = useRef(0);

	const drawRuler = (scrollLeft: number) => {
		lastScrollLeft.current = scrollLeft;
		const canvas = canvasRef.current;
		if (!canvas || containerWidth === 0) return;

		const dpr = window.devicePixelRatio || 1;
		const width = containerWidth * dpr;
		const height = RULER_HEIGHT * dpr;

		if (canvas.width !== width) canvas.width = width;
		if (canvas.height !== height) canvas.height = height;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, containerWidth, RULER_HEIGHT);

		const styles = getComputedStyle(canvas);
		const textColor = styles.getPropertyValue("--gray-11").trim();
		const lineColor = styles.getPropertyValue("--gray-9").trim();

		ctx.fillStyle = textColor;
		ctx.strokeStyle = lineColor;
		ctx.textAlign = "center";

		const { major, minor } = getTickInterval(zoom);

		const startTime = scrollLeft / zoom;
		const endTime = (scrollLeft + containerWidth) / zoom;
		const firstMajorTick = Math.ceil(startTime / major) * major;

		ctx.beginPath();
		const firstMinorTick = Math.ceil(startTime / minor) * minor;
		for (let time = firstMinorTick; time <= endTime; time += minor) {
			const x = time * zoom - scrollLeft;
			ctx.moveTo(x, RULER_HEIGHT - 5);
			ctx.lineTo(x, RULER_HEIGHT);
		}
		ctx.stroke();

		ctx.beginPath();
		for (let time = firstMajorTick; time <= endTime; time += major) {
			if (time < 0 || time > duration) continue;
			const x = time * zoom - scrollLeft;

			ctx.moveTo(x, RULER_HEIGHT - 10);
			ctx.lineTo(x, RULER_HEIGHT);

			const label = msToTimestamp(time * 1000);
			ctx.fillText(label, x, RULER_HEIGHT - 12);
		}
		ctx.stroke();
	};

	useImperativeHandle(ref, () => ({
		draw(scrollLeft: number) {
			drawRuler(scrollLeft);
		},
	}));

	useEffect(() => {
		drawRuler(lastScrollLeft.current);
	}, [zoom, containerWidth, duration]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: "100%",
				height: `${RULER_HEIGHT}px`,
				backgroundColor: "var(--white-3)",
			}}
		/>
	);
});
