import { defineStore } from "pinia";
import { parseLyric } from "./utils/ttml-lyric-parser";

export interface LyricWord {
	time: number;
	word: string;
}

export interface LyricLine {
	words: LyricWord[];
	isBackground: boolean;
	isDuet: boolean;
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
					time: w.time,
					word: w.word,
				})) ?? [
					{
						word: line.originalLyric,
						time: line.beginTime,
					},
				],
				isBackground: !!line.isBackgroundLyric,
				isDuet: !!line.shouldAlignRight,
			}));
			this.record();
		},
		addNewLine() {
			this.lyrics.push({
				words: [],
				isBackground: false,
				isDuet: false,
			});
			this.record();
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
					time: 0,
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
