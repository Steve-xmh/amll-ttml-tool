import { useAtomValue } from "jotai";
import type { FC } from "react";
import { lyricLinesAtom } from "$/states/main";
import { LyricLineSegment } from "./LyricLineSegment";

interface LyricTimelineOverlayProps {
	zoom: number;
}

export const LyricTimelineOverlay: FC<LyricTimelineOverlayProps> = ({
	zoom,
}) => {
	const { lyricLines } = useAtomValue(lyricLinesAtom);

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
			}}
		>
			{lyricLines.map((line) => (
				<LyricLineSegment key={line.id} line={line} zoom={zoom} />
			))}
		</div>
	);
};
