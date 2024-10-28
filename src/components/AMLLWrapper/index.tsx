import "@applemusic-like-lyrics/core/style.css";
import { LyricPlayer } from "@applemusic-like-lyrics/react";
import { Card } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import type { FC } from "react";
import {
	audioPlayingAtom,
	currentLyricLinesAtom,
	currentTimeAtom,
} from "../../states.ts";

export const AMLLWrapper: FC = () => {
	const lyricLines = useAtomValue(currentLyricLinesAtom);
	const currentTime = useAtomValue(currentTimeAtom);
	const isPlaying = useAtomValue(audioPlayingAtom);

	return (
		<Card
			style={{
				overflow: "hidden",
				flexGrow: "1",
				padding: "0",
				height: "100%",
			}}
		>
			<LyricPlayer
				style={{
					height: "100%",
					boxSizing: "content-box",
				}}
				lyricLines={lyricLines.lyricLines}
				currentTime={currentTime}
				playing={isPlaying}
			/>
		</Card>
	);
};
