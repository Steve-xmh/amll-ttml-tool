import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { FC } from "react";
import { useEffect } from "react";
import {
	dragDetailsAtom,
	isDraggingAtom,
	previewLineAtom,
} from "$/states/dnd.ts";
import { processedLyricLinesAtom } from "$/utils/segment-processing.ts";
import {
	commitUpdatedLine,
	getUpdatedLineForDivider,
} from "$/utils/timeline-mutations";
import { LyricLineSegment } from "./LyricLineSegment";

interface LyricTimelineOverlayProps {
	zoom: number;
	scrollLeft: number;
	clientWidth: number;
}

export const LyricTimelineOverlay: FC<LyricTimelineOverlayProps> = ({
	zoom,
	scrollLeft,
	clientWidth,
}) => {
	const processedLines = useAtomValue(processedLyricLinesAtom);
	const isDragging = useAtomValue(isDraggingAtom);
	const [dragDetails, setDragDetails] = useAtom(dragDetailsAtom);
	const setPreviewLine = useSetAtom(previewLineAtom);

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

		const handleGlobalMouseMove = (event: MouseEvent) => {
			event.preventDefault();
			const deltaX = event.clientX - startX;
			const deltaTimeMs = Math.round((deltaX / currentZoom) * 1000);
			const newTime = originalTime + deltaTimeMs;

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

			const deltaX = event.clientX - startX;
			const deltaTimeMs = Math.round((deltaX / currentZoom) * 1000);
			const newTime = originalTime + deltaTimeMs;

			const updatedLine = getUpdatedLineForDivider(
				lineBeingDragged,
				segmentIndex,
				newTime,
				isGapCreation,
				currentZoom,
			);

			commitUpdatedLine(updatedLine);
			setDragDetails(null);
			setPreviewLine(null);
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		window.addEventListener("mouseup", handleGlobalMouseUp, { once: true });

		return () => {
			window.removeEventListener("mousemove", handleGlobalMouseMove);
			window.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, [
		isDragging,
		dragDetails,
		setDragDetails,
		setPreviewLine,
		zoom,
		processedLines,
	]);

	const bufferPx = 500;
	const viewStartMs = ((scrollLeft - bufferPx) / zoom) * 1000;
	const viewEndMs = ((scrollLeft + clientWidth + bufferPx) / zoom) * 1000;

	const visibleLines = processedLines.filter((line) => {
		if (!line.startTime || !line.endTime) return false;
		return line.endTime > viewStartMs && line.startTime < viewEndMs;
	});

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
			}}
		>
			{visibleLines.map((line) => (
				<LyricLineSegment key={line.id} line={line} zoom={zoom} />
			))}
		</div>
	);
};
