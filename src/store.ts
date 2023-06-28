import { defineStore } from "pinia";
import { parseLyric } from "./utils/ttml-lyric-parser";
import { cut } from "./libs/jieba-wasm";
import { toRaw } from "vue";
import exportTTMLText from "./utils/ttml-writer";
import type { LyricLine as RawLyricLine } from "./utils/lyric-types";

export interface LyricWord {
	startTime: number;
	endTime: number;
	word: string;
}

export interface LyricLine {
	words: LyricWord[];
	translatedLyric: string;
	romanLyric: string;
	isBackground: boolean;
	isDuet: boolean;
	selected: boolean;
}

export const useEditingLyric = defineStore("editing-lyric", {
	state: () => ({
		artists: [] as string[],
		lyrics: [] as LyricLine[],
	}),
	actions: {
		reset() {
			this.artists = [];
			this.lyrics = [];
			this.record();
		},
		loadLyric(lyricLines: ReturnType<typeof parseLyric>) {
			this.artists = [];
			this.lyrics = lyricLines.map((line) => ({
				words: line.dynamicLyric?.map((w) => ({
					startTime: w.time,
					endTime: w.time + w.duration,
					word: w.word,
				})) ?? [
					{
						word: line.originalLyric,
						startTime: line.beginTime,
						endTime: line.duration,
					},
				],
				translatedLyric: line.translatedLyric ?? "",
				romanLyric: line.romanLyric ?? "",
				isBackground: !!line.isBackgroundLyric,
				isDuet: !!line.shouldAlignRight,
				selected: false,
			}));
			this.record();
		},
		addNewLine() {
			this.lyrics.push({
				words: [],
				translatedLyric: "",
				romanLyric: "",
				isBackground: false,
				isDuet: false,
				selected: false,
			});
			this.record();
		},
		selectLine(lineIndex: number) {
			if (this.lyrics[lineIndex]) this.lyrics[lineIndex].selected = true;
		},
		selectAllLine() {
			this.lyrics.forEach((line) => (line.selected = true));
		},
		unselectAllLine() {
			this.lyrics.forEach((line) => (line.selected = false));
		},
		invertSelectAllLine() {
			this.lyrics.forEach((line) => (line.selected = !line.selected));
		},
		removeLine(lineIndex: number) {
			if (this.lyrics[lineIndex]) {
				this.lyrics.splice(lineIndex, 1);
				this.record();
			}
		},
		addNewWord(lineIndex: number, word: string) {
			if (this.lyrics[lineIndex]) {
				this.lyrics[lineIndex].words.push({
					startTime: 0,
					endTime: 0,
					word,
				});
				this.record();
			}
		},
		modifyWord(lineIndex: number, wordIndex: number, newWord: string) {
			if (this.lyrics[lineIndex]) {
				if (this.lyrics[lineIndex].words[wordIndex]) {
					this.lyrics[lineIndex].words[wordIndex].word = newWord;
					this.record();
				}
			}
		},
		modifyTranslatedLine(lineIndex: number, text: string) {
			if (this.lyrics[lineIndex]) {
				this.lyrics[lineIndex].translatedLyric = text;
				this.record();
			}
		},
		modifyRomanLine(lineIndex: number, text: string) {
			if (this.lyrics[lineIndex]) {
				this.lyrics[lineIndex].romanLyric = text;
				this.record();
			}
		},
		toggleSelectedLineBackground() {
			const hasNoBg =
				this.lyrics.filter((line) => line.selected && !line.isBackground)
					.length > 0;
			this.lyrics.forEach((line) => {
				if (line.selected) line.isBackground = hasNoBg;
			});
		},
		toggleSelectedLineDuet() {
			const hasNoDuet =
				this.lyrics.filter((line) => line.selected && !line.isDuet).length > 0;
			this.lyrics.forEach((line) => {
				if (line.selected) line.isDuet = hasNoDuet;
			});
		},
		removeWord(lineIndex: number, wordIndex: number) {
			if (this.lyrics[lineIndex]) {
				this.lyrics[lineIndex].words.splice(wordIndex, 1);
				this.record();
			}
		},
		setWordTime(lineIndex: number, wordIndex: number, time: number) {
			if (this.lyrics?.[lineIndex]?.words?.[wordIndex]) {
				this.lyrics[lineIndex].words[wordIndex].startTime = time;
				if (wordIndex > 0) {
					this.lyrics[lineIndex].words[wordIndex - 1].endTime = time;
				}
				let lastLineIndex = lineIndex;
				let lastWordIndex = wordIndex;
				do {
					if (lastWordIndex > 0) {
						lastWordIndex--;
					} else if (lastLineIndex > 0) {
						lastWordIndex = this.lyrics[--lastLineIndex].words.length - 1;
					}
				} while (
					this.lyrics[lastLineIndex].words[lastWordIndex].word.trim().length ===
					0
				);
				if (lastLineIndex !== lineIndex || lastWordIndex !== wordIndex) {
					this.lyrics[lastLineIndex].words[lastWordIndex].endTime = time;
				}
				this.record();
			}
		},
		setWordEndTime(lineIndex: number, wordIndex: number, time: number) {
			if (this.lyrics?.[lineIndex]?.words?.[wordIndex]) {
				this.lyrics[lineIndex].words[wordIndex].endTime = time;
				this.record();
			}
		},
		setWordTimeNoLast(lineIndex: number, wordIndex: number, time: number) {
			if (this.lyrics?.[lineIndex]?.words?.[wordIndex]) {
				this.lyrics[lineIndex].words[wordIndex].startTime = time;
				this.record();
			}
		},
		toRawLine(lineIndex: number): RawLyricLine {
			const line = this.lyrics[lineIndex];
			if (line) {
				if (line.words.length === 1) {
					return {
						originalLyric: line.words[0].word,
						beginTime: line.words[0].startTime,
						duration: line.words[0].endTime - line.words[0].startTime,
						translatedLyric: line.translatedLyric,
						romanLyric: line.romanLyric,
						shouldAlignRight: line.isDuet,
					};
				} else {
					return {
						originalLyric: line.words.map((w) => w.word).join(""),
						beginTime: line.words[0].startTime,
						duration:
							line.words[line.words.length - 1].endTime -
							line.words[0].startTime,
						dynamicLyricTime: line.words[0].startTime,
						shouldAlignRight: line.isDuet,
						translatedLyric: line.translatedLyric,
						romanLyric: line.romanLyric,
						dynamicLyric: line.words.map((w) => ({
							word: w.word,
							time: w.startTime,
							duration: w.endTime - w.startTime,
							flag: 0,
						})),
					};
				}
			} else {
				throw new TypeError(`第 ${lineIndex} 行歌词不存在`);
			}
		},
		toTTML() {
			const transformed: RawLyricLine[] = [];

			for (let i = 0; i < this.lyrics.length; i++) {
				const line = this.lyrics[i];
				if (line.isBackground) {
					const lastLine = transformed[transformed.length - 1];
					if (lastLine && lastLine.backgroundLyric === undefined) {
						lastLine.backgroundLyric = this.toRawLine(i);
					} else {
						throw new TypeError(
							`第 ${i} 行背景人声歌词重复，每行普通歌词只能拥有一个背景人声歌词`,
						);
					}
				} else {
					transformed.push(this.toRawLine(i));
				}
			}

			return exportTTMLText(transformed);
		},
		async splitLineByJieba() {
			this.lyrics = this.lyrics.map((line) => {
				if (!line.selected) return line;
				const newWords = toRaw(line.words).flatMap((w) => {
					const splited: string[] = cut(w.word, true);
					const charDuration = (w.endTime - w.startTime) / w.word.length;
					const result: LyricWord[] = [];
					let i = 0;
					for (const split of splited) {
						result.push({
							startTime: w.startTime + i * charDuration,
							endTime: w.startTime + (i + split.length) * charDuration,
							word: split,
						});
						i += split.length;
					}
					return result;
				});

				line.words = newWords;

				return line;
			});
			this.record();
		},
	},
	undo: {
		enable: true,
	},
});

export const useRightClickLyricLine = defineStore("right-click-lyric-line", {
	state: () => ({
		show: false,
		selectedLine: 0,
		selectedWord: 0,
		x: 0,
		y: 0,
	}),
	actions: {
		showMenuForLyric(
			lineIndex: number,
			wordIndex: number,
			x: number,
			y: number,
		) {
			this.show = true;
			this.selectedLine = lineIndex;
			this.selectedWord = wordIndex;
			this.x = x;
			this.y = y;
		},
	},
});

export const useSettings = defineStore("settings", {
	state: () => ({
		showTranslateLine: false,
		showRomanLine: false,
		volume: 0,
	}),
	persist: true,
});

export const useAudio = defineStore("audio", {
	state: () => ({
		playing: false,
		canPlay: false,
		audioURL: "",
		currentTime: 0,
		duration: 0,
	}),
});

export const useCurrentSyncWord = defineStore("current-sync-word", {
	state: () => ({
		lineIndex: -1,
		wordIndex: -1,
	}),
});
