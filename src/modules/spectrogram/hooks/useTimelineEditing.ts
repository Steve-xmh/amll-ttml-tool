import { useAtomValue, useSetAtom } from "jotai";
import { useSetImmerAtom } from "jotai-immer";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	adjustLineEndTime,
	shiftLineStartTime,
	tryFixPartialInitialization,
	tryInitializeZeroTimestampLine,
} from "$/modules/spectrogram/utils/timeline-mutations";
import {
	editingTimeFieldAtom,
	lyricLinesAtom,
	requestFocusAtom,
	selectedLinesAtom,
} from "$/states/main.ts";
import { spectrogramHoverTimeMsAtom } from "../states";

export function useTimelineEditing(scrollLeft: number, zoom: number) {
	const editingTimeField = useAtomValue(editingTimeFieldAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const selectedLines = useAtomValue(selectedLinesAtom);
	const rawLyricLines = useAtomValue(lyricLinesAtom);
	const setRequestFocus = useSetAtom(requestFocusAtom);
	const [pendingStartTime, setPendingStartTime] = useState<number | null>(null);
	const hoverTimeMs = useAtomValue(spectrogramHoverTimeMsAtom);

	const referenceStartTime = useMemo(() => {
		if (pendingStartTime !== null) return pendingStartTime;

		if (editingTimeField?.field === "endTime") {
			let maxStartTime = -Infinity;
			let hasSelection = false;

			for (const line of rawLyricLines.lyricLines) {
				if (selectedLines.has(line.id)) {
					hasSelection = true;
					if (line.startTime > maxStartTime) {
						maxStartTime = line.startTime;
					}
				}
			}
			return hasSelection ? maxStartTime : 0;
		}
		return 0;
	}, [pendingStartTime, editingTimeField, rawLyricLines, selectedLines]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (pendingStartTime !== null || editingTimeField) {
					setPendingStartTime(null);
					if (document.activeElement instanceof HTMLElement) {
						document.activeElement.blur();
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [pendingStartTime, editingTimeField]);

	const handleContainerMouseDown = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (editingTimeField && !editingTimeField.isWord) {
				event.preventDefault();

				const rect = event.currentTarget.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const clickX = scrollLeft + x;
				const timeMs = (clickX / zoom) * 1000;

				if (editingTimeField.field === "startTime") {
					setPendingStartTime(timeMs);
					setTimeout(() => {
						setRequestFocus("endTime");
					}, 0);
				} else if (editingTimeField.field === "endTime") {
					if (timeMs <= referenceStartTime) {
						return;
					}

					editLyricLines((draft) => {
						for (const line of draft.lyricLines) {
							if (selectedLines.has(line.id)) {
								const newStartTime = pendingStartTime ?? line.startTime;
								const newEndTime = timeMs;

								if (newEndTime <= newStartTime) continue;

								if (
									tryInitializeZeroTimestampLine(line, newStartTime, newEndTime)
								) {
									continue;
								}

								tryFixPartialInitialization(line);

								shiftLineStartTime(line, newStartTime);

								adjustLineEndTime(line, newEndTime);
							}
						}
					});

					setPendingStartTime(null);
					setTimeout(() => {
						if (document.activeElement instanceof HTMLElement) {
							document.activeElement.blur();
						}
					}, 0);
				}
			}
		},
		[
			editingTimeField,
			scrollLeft,
			zoom,
			editLyricLines,
			selectedLines,
			setRequestFocus,
			pendingStartTime,
			referenceStartTime,
		],
	);

	const isInvalidEndTime =
		editingTimeField?.field === "endTime" && hoverTimeMs <= referenceStartTime;

	const pendingCursorPosition =
		pendingStartTime !== null ? (pendingStartTime / 1000) * zoom : null;

	const showRangePreview =
		editingTimeField?.field === "endTime" &&
		pendingStartTime !== null &&
		!isInvalidEndTime;

	let previewStyle: React.CSSProperties | undefined;
	if (showRangePreview && pendingStartTime !== null) {
		const startPx = (pendingStartTime / 1000) * zoom;
		const endPx = (hoverTimeMs / 1000) * zoom;
		const width = endPx - startPx;

		if (width > 0) {
			previewStyle = {
				left: `${startPx}px`,
				width: `${width}px`,
			};
		}
	}

	return {
		handleContainerMouseDown,
		isInvalidEndTime,
		pendingCursorPosition,
		showRangePreview,
		previewStyle,
		editingTimeField,
		referenceStartTime,
	};
}
