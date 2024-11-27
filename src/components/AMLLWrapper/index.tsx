// #if !AMLL_LOCAL_EXISTS
import "@applemusic-like-lyrics/core/style.css";
// #endif
import {
	audioPlayingAtom,
	currentLyricLinesAtom,
	currentTimeAtom,
	isDarkThemeAtom,
} from "$/states/main.ts";
import {
	lyricWordFadeWidthAtom,
	showRomanLinesAtom,
	showTranslationLinesAtom,
} from "$/states/preview.ts";
import {
	LyricPlayer,
	type LyricPlayerRef,
} from "@applemusic-like-lyrics/react";
import { Card } from "@radix-ui/themes";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import { type FC, useEffect, useMemo, useRef } from "react";
import styles from "./index.module.css";

export const AMLLWrapper: FC = () => {
	const originalLyricLines = useAtomValue(currentLyricLinesAtom);
	const currentTime = useAtomValue(currentTimeAtom);
	const isPlaying = useAtomValue(audioPlayingAtom);
	const darkMode = useAtomValue(isDarkThemeAtom);
	const showTranslationLines = useAtomValue(showTranslationLinesAtom);
	const showRomanLines = useAtomValue(showRomanLinesAtom);
	const wordFadeWidth = useAtomValue(lyricWordFadeWidthAtom);
	const playerRef = useRef<LyricPlayerRef>(null);

	const lyricLines = useMemo(() => {
		return originalLyricLines.lyricLines.map((line) => ({
			...line,
			translatedLyric: showTranslationLines ? line.translatedLyric : "",
			romanLyric: showRomanLines ? line.romanLyric : "",
		}));
	}, [originalLyricLines, showTranslationLines, showRomanLines]);

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
				lyricLines={lyricLines}
				currentTime={currentTime}
				playing={isPlaying}
				wordFadeWidth={wordFadeWidth}
				ref={playerRef}
			/>
		</Card>
	);
};
