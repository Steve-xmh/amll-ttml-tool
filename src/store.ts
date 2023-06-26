import { defineStore } from "pinia";
import { parseLyric } from "./utils/ttml-lyric-parser";

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
		removeWord(lineIndex: number, wordIndex: number) {
			if (this.lyrics[lineIndex]) {
				this.lyrics[lineIndex].words.splice(wordIndex, 1);
				this.record();
			}
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
	}),
	persist: true,
});
