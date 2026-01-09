import { useAtom, useAtomValue } from "jotai";
import { useCallback, useRef } from "react";
import {
	spectrogramContainerWidthAtom,
	spectrogramScrollLeftAtom,
	spectrogramZoomAtom,
} from "$/modules/spectrogram/states";
import { currentDurationAtom } from "../states";
import { clampScroll, clampZoom } from ".";

export const useAudioRegion = (
	sliderWidthPx: number,
	containerRef: React.RefObject<HTMLDivElement | null>,
	isDraggingRef?: React.RefObject<boolean>,
) => {
	const [zoom, setZoom] = useAtom(spectrogramZoomAtom);
	const [scrollLeft, setScrollLeft] = useAtom(spectrogramScrollLeftAtom);
	const containerWidth = useAtomValue(spectrogramContainerWidthAtom);
	const currentDuration = useAtomValue(currentDurationAtom);

	const dragStateRef = useRef<{
		type: "drag" | "resizeLeft" | "resizeRight";
		initialMouseX: number;
		initialScrollLeft: number;
		startTimeMs: number;
		endTimeMs: number;
		timePerPixelOnSlider: number;
	} | null>(null);

	const handleDragMove = useCallback(
		(event: MouseEvent) => {
			if (
				!dragStateRef.current ||
				currentDuration <= 0 ||
				!containerRef.current
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

			const sliderLeftPx = containerRef.current.getBoundingClientRect().left;
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
		[
			containerWidth,
			currentDuration,
			setScrollLeft,
			setZoom,
			zoom,
			containerRef,
		],
	);

	const handleDragEnd = useCallback(() => {
		dragStateRef.current = null;
		if (isDraggingRef) isDraggingRef.current = false;
		window.removeEventListener("mousemove", handleDragMove);
		window.removeEventListener("mouseup", handleDragEnd);
	}, [handleDragMove, isDraggingRef]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (currentDuration <= 0 || sliderWidthPx <= 0 || !containerRef.current)
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

			if (isDraggingRef) isDraggingRef.current = true;

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
			containerRef,
			isDraggingRef,
		],
	);

	const audioLoaded = currentDuration > 0 && sliderWidthPx > 0;
	let rectLeftPx = 0;
	let rectWidthPx = 0;
	const startTimeMs = (scrollLeft / zoom) * 1000;
	const viewDurationMs = (containerWidth / zoom) * 1000;
	const durationS = currentDuration / 1000;

	if (audioLoaded) {
		const pixelsPerMsOnSlider = sliderWidthPx / currentDuration;
		rectLeftPx = startTimeMs * pixelsPerMsOnSlider;
		rectWidthPx = viewDurationMs * pixelsPerMsOnSlider;
	}

	return {
		handleMouseDown,
		rectLeftPx,
		rectWidthPx,
		audioLoaded,
		startTimeS: startTimeMs / 1000,
		endTimeS: (startTimeMs + viewDurationMs) / 1000,
		durationS,
		viewDurationMs,
		startTimeMs,
	};
};
