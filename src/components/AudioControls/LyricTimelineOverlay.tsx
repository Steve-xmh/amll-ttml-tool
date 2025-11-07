import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { FC } from "react";
import { useContext, useEffect, useRef } from "react";
import { currentTimeAtom } from "$/states/audio.ts";
import {
	dragDetailsAtom,
	isDraggingAtom,
	previewLineAtom,
	wordPanOperationAtom,
} from "$/states/dnd.ts";
import { globalStore } from "$/states/store.ts";
import { processedLyricLinesAtom } from "$/utils/segment-processing.ts";
import {
	commitUpdatedLine,
	getUpdatedLineForDivider,
	getUpdatedLineForWordPan,
} from "$/utils/timeline-mutations";
import { LyricLineSegment } from "./LyricLineSegment";
import styles from "./LyricTimelineOverlay.module.css";
import { SpectrogramContext } from "./SpectrogramContext";

interface LyricTimelineOverlayProps {
	zoom: number;
	scrollLeft: number;
	clientWidth: number;
}

const SNAP_THRESHOLD_PX = 7;

export const LyricTimelineOverlay: FC<LyricTimelineOverlayProps> = ({
	zoom,
	scrollLeft,
	clientWidth,
}) => {
	const processedLines = useAtomValue(processedLyricLinesAtom);
	const isDragging = useAtomValue(isDraggingAtom);
	const [dragDetails, setDragDetails] = useAtom(dragDetailsAtom);
	const [wordPanOperation, setWordPanOperation] = useAtom(wordPanOperationAtom);
	const setPreviewLine = useSetAtom(previewLineAtom);
	const currentTime = useAtomValue(currentTimeAtom);
	const snapTargetsMs = useRef<number[]>([]);
	const scrollContainerRef = useContext(SpectrogramContext);

	useEffect(() => {
		if (!isDragging || !dragDetails) {
			return;
		}

		const { startX, lineId, segmentIndex, isGapCreation } = dragDetails;

		const currentZoom = zoom;
		const lineBeingDragged = processedLines.find((l) => l.id === lineId);
		if (!lineBeingDragged) {
			setDragDetails(null);
			return;
		}

		let originalTime: number;
		if (segmentIndex === -1) {
			originalTime = lineBeingDragged.startTime;
		} else {
			const leftSegment = lineBeingDragged.segments[segmentIndex];
			if (!leftSegment) {
				setDragDetails(null);
				return;
			}
			originalTime = leftSegment.endTime;
		}

		const isLineBoundaryDrag =
			segmentIndex === -1 ||
			segmentIndex === lineBeingDragged.segments.length - 1;

		const targets: number[] = [currentTime];

		if (isLineBoundaryDrag) {
			const otherLineBoundaries = processedLines
				.filter((line) => line.id !== lineId)
				.flatMap((line) => [line.startTime, line.endTime]);
			targets.push(...otherLineBoundaries);
		}

		snapTargetsMs.current = targets.filter(
			(time): time is number => time != null,
		);

		const handleGlobalMouseMove = (event: MouseEvent) => {
			event.preventDefault();
			const deltaX = event.clientX - startX;
			const deltaTimeMs = Math.round((deltaX / currentZoom) * 1000);
			let newTime = originalTime + deltaTimeMs;

			if (!event.shiftKey) {
				let closestSnapTime: number | null = null;
				let minDistancePx = SNAP_THRESHOLD_PX;

				const newTimePx = (newTime / 1000) * currentZoom;

				for (const targetTime of snapTargetsMs.current) {
					const targetTimePx = (targetTime / 1000) * currentZoom;
					const distancePx = Math.abs(newTimePx - targetTimePx);

					if (distancePx < minDistancePx) {
						minDistancePx = distancePx;
						closestSnapTime = targetTime;
					}
				}

				if (closestSnapTime !== null) {
					newTime = closestSnapTime;
				}
			}

			const preview = getUpdatedLineForDivider(
				lineBeingDragged,
				segmentIndex,
				newTime,
				isGapCreation,
				currentZoom,
			);

			setPreviewLine(preview);
		};

		const handleGlobalMouseUp = (event: MouseEvent) => {
			event.preventDefault();

			const lastSnappedLine = globalStore.get(previewLineAtom);

			if (lastSnappedLine) {
				commitUpdatedLine(lastSnappedLine);
			}

			setDragDetails(null);
			setPreviewLine(null);
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		window.addEventListener("mouseup", handleGlobalMouseUp, { once: true });

		return () => {
			window.removeEventListener("mousemove", handleGlobalMouseMove);
			window.removeEventListener("mouseup", handleGlobalMouseUp);
			snapTargetsMs.current = [];
		};
	}, [
		isDragging,
		dragDetails,
		setDragDetails,
		setPreviewLine,
		zoom,
		processedLines,
		currentTime,
	]);

	useEffect(() => {
		if (!wordPanOperation) {
			return;
		}

		const { lineId, wordId, initialMouseTimeMS, initialWordStartMS } =
			wordPanOperation;

		const processedLine = processedLines.find((l) => l.id === lineId);
		if (!processedLine) {
			return;
		}

		const handleGlobalMouseMove = (event: MouseEvent) => {
			event.preventDefault();

			const scrollContainer = scrollContainerRef.current;
			if (!scrollContainer) return;
			const rect = scrollContainer.getBoundingClientRect();

			const mouseXPx = event.clientX - rect.left;
			const currentMouseTimeMS = ((scrollLeft + mouseXPx) / zoom) * 1000;

			const timeDeltaMS = currentMouseTimeMS - initialMouseTimeMS;
			const desiredNewStartMS = initialWordStartMS + timeDeltaMS;

			const preview = getUpdatedLineForWordPan(
				processedLine,
				wordId,
				desiredNewStartMS,
				zoom,
			);

			setPreviewLine(preview);
		};

		const handleGlobalMouseUp = (event: MouseEvent) => {
			event.preventDefault();

			const lastSnappedLine = globalStore.get(previewLineAtom);

			if (lastSnappedLine) {
				commitUpdatedLine(lastSnappedLine);
			}

			setWordPanOperation(null);
			setPreviewLine(null);
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		window.addEventListener("mouseup", handleGlobalMouseUp, { once: true });

		return () => {
			window.removeEventListener("mousemove", handleGlobalMouseMove);
			window.removeEventListener("mouseup", handleGlobalMouseUp);
			setPreviewLine(null);
		};
	}, [
		wordPanOperation,
		setWordPanOperation,
		zoom,
		scrollLeft,
		scrollContainerRef,
		processedLines,
		setPreviewLine,
	]);

	const bufferPx = 500;
	const viewStartMs = ((scrollLeft - bufferPx) / zoom) * 1000;
	const viewEndMs = ((scrollLeft + clientWidth + bufferPx) / zoom) * 1000;

	const visibleLines = processedLines.filter((line) => {
		if (!line.startTime || !line.endTime) return false;
		return line.endTime > viewStartMs && line.startTime < viewEndMs;
	});

	return (
		<div className={styles.overlay}>
			{visibleLines.map((line) => (
				<LyricLineSegment
					key={line.id}
					line={line}
					zoom={zoom}
					allLines={processedLines}
				/>
			))}
		</div>
	);
};
