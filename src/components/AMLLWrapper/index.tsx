// import "@applemusic-like-lyrics/core/style.css";
import { LyricPlayer } from "@applemusic-like-lyrics/react";
import { Card } from "@radix-ui/themes";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import type { FC } from "react";
import {
	audioPlayingAtom,
	currentLyricLinesAtom,
	currentTimeAtom,
	isDarkThemeAtom,
} from "../../states/main.ts";
import styles from "./index.module.css";

export const AMLLWrapper: FC = () => {
	const lyricLines = useAtomValue(currentLyricLinesAtom);
	const currentTime = useAtomValue(currentTimeAtom);
	const isPlaying = useAtomValue(audioPlayingAtom);
	const darkMode = useAtomValue(isDarkThemeAtom);

	return (
		<Card className={classNames(styles.amllWrapper, darkMode && styles.isDark)}>
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
