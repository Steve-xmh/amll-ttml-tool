import { useStore } from "jotai";
import { useEffect } from "react";
import { predictLineRomanization } from "$/modules/segmentation/utils/Transliteration/distributor";
import { lyricLinesAtom } from "$/states/main";

export const useRomanDebugger = () => {
	const store = useStore();

	useEffect(() => {
		// biome-ignore lint/suspicious/noExplicitAny: 调试用
		(window as any).debugRoman = (startLine = 0, endLine = 100) => {
			const { lyricLines } = store.get(lyricLinesAtom);
			const targetLines = lyricLines.slice(startLine, endLine + 1);
			const report = targetLines.map((line, index) => {
				const globalIndex = startLine + index;
				const fullRoman = line.romanLyric || "";
				const predictions = predictLineRomanization(line.words, fullRoman);

				const wordsDebug = line.words.map((word, wIdx) => {
					return {
						word: word.word,
						emptyBeat: word.emptyBeat,
						predicted: predictions[wIdx],
					};
				});

				return {
					line: globalIndex,
					originalText: line.words.map((w) => w.word).join(""),
					romanSource: fullRoman,
					syllables: wordsDebug,
				};
			});

			const jsonOutput = JSON.stringify(report, null, 2);
			console.log(jsonOutput);
		};
	}, [store]);
};
