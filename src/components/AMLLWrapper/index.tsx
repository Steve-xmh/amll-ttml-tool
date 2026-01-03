// #if AMLL_LOCAL_EXISTS
// #warning Using local Apple Music Like Lyrics, skip importing css style
// #else
import "@applemusic-like-lyrics/core/style.css";
// #endif

import {
	LyricPlayer,
	type LyricPlayerRef,
} from "@applemusic-like-lyrics/react";
import { Card } from "@radix-ui/themes";
import structuredClone from "@ungap/structured-clone";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import { memo, useEffect, useMemo, useRef } from "react";
import { audioEngine } from "$/modules/audio/audio-engine";
import { audioPlayingAtom, currentTimeAtom } from "$/modules/audio/states";
import {
	lyricWordFadeWidthAtom,
	showRomanLinesAtom,
	showTranslationLinesAtom,
} from "$/modules/settings/states/preview";
import { isDarkThemeAtom, lyricLinesAtom } from "$/states/main.ts";
import styles from "./index.module.css";

export const AMLLWrapper = memo(() => {
	const originalLyricLines = useAtomValue(lyricLinesAtom);
	const currentTime = useAtomValue(currentTimeAtom);
	const isPlaying = useAtomValue(audioPlayingAtom);
	const darkMode = useAtomValue(isDarkThemeAtom);
	const showTranslationLines = useAtomValue(showTranslationLinesAtom);
	const showRomanLines = useAtomValue(showRomanLinesAtom);
	const wordFadeWidth = useAtomValue(lyricWordFadeWidthAtom);
	const playerRef = useRef<LyricPlayerRef>(null);

	const lyricLines = useMemo(() => {
		return structuredClone(
			originalLyricLines.lyricLines.map((line) => ({
				...line,
				translatedLyric: showTranslationLines ? line.translatedLyric : "",
				romanLyric: showRomanLines ? line.romanLyric : "",
			})),
		);
	}, [originalLyricLines, showTranslationLines, showRomanLines]);

	useEffect(() => {
		setTimeout(() => {
			playerRef.current?.lyricPlayer?.calcLayout(true);
		}, 1500);
	}, []);

	return (
		<Card className={classNames(styles.amllWrapper, darkMode && styles.isDark)}>
			<LyricPlayer
				style={{
					height: "100%",
					boxSizing: "content-box",
				}}
				onLyricLineClick={(evt) => {
					playerRef.current?.lyricPlayer?.resetScroll();
					audioEngine.seekMusic(evt.line.getLine().startTime / 1000);
				}}
				lyricLines={lyricLines}
				currentTime={currentTime}
				playing={isPlaying}
				wordFadeWidth={wordFadeWidth}
				ref={playerRef}
			/>
		</Card>
	);
});

export default AMLLWrapper;
