import { useSetAtom } from "jotai";
import type { FC } from "react";
import { dragDetailsAtom } from "$/states/dnd.ts";

interface DividerSegmentProps {
	lineId: string;
	segmentIndex: number;
	timeMs: number;
	lineStartTime: number;
	zoom: number;
}

const DIVIDER_WIDTH_PX = 15;

export const DividerSegment: FC<DividerSegmentProps> = ({
	lineId,
	segmentIndex,
	timeMs,
	lineStartTime,
	zoom,
}) => {
	const setDragDetails = useSetAtom(dragDetailsAtom);

	if (timeMs == null || timeMs < 0 || lineStartTime == null) return null;

	const left = ((timeMs - lineStartTime) / 1000) * zoom - DIVIDER_WIDTH_PX / 2;

	const startDrag = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragDetails({
			lineId: lineId,
			segmentIndex: segmentIndex,
			zoom: zoom,
			startX: e.clientX,
			isGapCreation: e.altKey,
		});
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: <hr> 在这里不适用
		<div
			style={{
				position: "absolute",
				left: `${left}px`,
				width: `${DIVIDER_WIDTH_PX}px`,
				top: 0,
				bottom: 0,
				cursor: "ew-resize",
				pointerEvents: "auto",
				zIndex: 2,
			}}
			onMouseDown={startDrag}
			role="separator"
			tabIndex={0}
			aria-orientation="horizontal"
			aria-valuenow={timeMs}
		/>
	);
};
