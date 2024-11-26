// #if AMLL_LOCAL_EXISTS
// #warning Using local Apple Music Like Lyrics, skip importing css style
// #else
import "@applemusic-like-lyrics/core/style.css";
// #endif
import {audioPlayingAtom, currentLyricLinesAtom, currentTimeAtom, isDarkThemeAtom,} from "$/states/main.ts";
import {LyricPlayer, type LyricPlayerRef,} from "@applemusic-like-lyrics/react";
import {Card} from "@radix-ui/themes";
import classNames from "classnames";
import {useAtomValue} from "jotai";
import {type FC, useEffect, useRef} from "react";
import styles from "./index.module.css";

export const AMLLWrapper: FC = () => {
	const lyricLines = useAtomValue(currentLyricLinesAtom);
	const currentTime = useAtomValue(currentTimeAtom);
	const isPlaying = useAtomValue(audioPlayingAtom);
	const darkMode = useAtomValue(isDarkThemeAtom);
	const playerRef = useRef<LyricPlayerRef>(null);

	useEffect(() => {
		setTimeout(() => {
			playerRef.current?.lyricPlayer?.calcLayout(true, true);
		}, 1500);
	}, []);

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
				ref={playerRef}
			/>
		</Card>
	);
};
