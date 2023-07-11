import { defineStore } from "pinia";
import { parseLyric } from "../utils/ttml-lyric-parser";
import { cut } from "../libs/jieba-wasm";
import { toRaw } from "vue";
import exportTTMLText from "../utils/ttml-writer";
import type { LyricLine as RawLyricLine } from "../utils/lyric-types";
import { waitNextTick } from "../utils";
import { useProgress } from "./progress";
import {
	parseLrc,
	parseYrc,
	parseQrc,
	parseLys,
	set_panic_hook,
	stringifyLrc,
	stringifyYrc,
	stringifyQrc,
	stringifyLys,
} from "../../src-wasm/pkg";

set_panic_hook();

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

export type LyricWordWithId = LyricWord & {
	lineIndex: number;
	id: number;
};

export type LyricLineWithId = LyricLine & {
	words: LyricWordWithId[];
	id: number;
};

export const useEditingLyric = defineStore("editing-lyric", {
	state: () => ({
		artists: [] as string[],
		lyrics: [] as LyricLine[],
	}),
	getters: {
		lineWithIds: (state): LyricLineWithId[] =>
			state.lyrics.map((l, lid) => ({
				...l,
				words: l.words.map((w, wid) => ({
					...w,
					lineIndex: lid,
					id: wid,
				})),
				id: lid,
			})),
	},
	actions: {
		reset() {
			this.artists.splice(0, this.artists.length);
			this.lyrics.splice(0, this.lyrics.length);
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
						endTime: line.beginTime + line.duration,
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
		loadLRC(lyric: string) {
			this.artists = [];
			this.lyrics = parseLrc(lyric).map((line) => ({
				words: line.words.map((w) => ({
					startTime: w.startTime,
					endTime: w.endTime,
					word: w.word,
				})),
				translatedLyric: "",
				romanLyric: "",
				isBackground: false,
				isDuet: false,
				selected: false,
			}));
			this.record();
		},
		loadYRC(lyric: string) {
			this.artists = [];
			this.lyrics = parseYrc(lyric).map((line) => ({
				words: line.words.map((w) => ({
					startTime: w.startTime,
					endTime: w.endTime,
					word: w.word,
				})),
				translatedLyric: "",
				romanLyric: "",
				isBackground: false,
				isDuet: false,
				selected: false,
			}));
			this.record();
		},
		loadQRC(lyric: string) {
			this.artists = [];
			this.lyrics = parseQrc(lyric).map((line) => ({
				words: line.words.map((w) => ({
					startTime: w.startTime,
					endTime: w.endTime,
					word: w.word,
				})),
				translatedLyric: "",
				romanLyric: "",
				isBackground: false,
				isDuet: false,
				selected: false,
			}));
			this.record();
		},
		loadLYS(lyric: string) {
			this.artists = [];
			this.lyrics = parseLys(lyric).map((line) => ({
				words: line.words.map((w) => ({
					startTime: w.startTime,
					endTime: w.endTime,
					word: w.word,
				})),
				translatedLyric: "",
				romanLyric: "",
				isBackground: !!line.isBG,
				isDuet: !!line.isDuet,
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
		insertNewLineAt(lineIndex: number) {
			this.lyrics.splice(lineIndex, 0, {
				words: [],
				translatedLyric: "",
				romanLyric: "",
				isBackground: false,
				isDuet: false,
				selected: false,
			})
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
		splitWord(lineIndex: number, wordIndex: number, cutPos: number) {
			if (this.lyrics?.[lineIndex]?.words?.[wordIndex]) {
				const oldWord = toRaw(this.lyrics[lineIndex].words[wordIndex]);
				const leftWord = {
					...oldWord,
				};
				const rightWord = {
					...oldWord,
				};
				leftWord.word = oldWord.word.slice(0, cutPos);
				rightWord.word = oldWord.word.slice(cutPos);
				const oldDuration = oldWord.endTime - oldWord.startTime;
				rightWord.startTime = leftWord.endTime =
					oldWord.startTime + (oldDuration / oldWord.word.length) * cutPos;
				this.lyrics[lineIndex].words.splice(wordIndex, 1, leftWord, rightWord);
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
		toLRC() {
			const lines = toRaw(this.lyrics);
			return stringifyLrc(lines);
		},
		toYRC() {
			const lines = toRaw(this.lyrics);
			return stringifyYrc(lines);
		},
		toQRC() {
			const lines = toRaw(this.lyrics);
			return stringifyQrc(lines);
		},
		toLYS() {
			const lines = toRaw(this.lyrics);
			return stringifyLys(lines);
		},
		async splitLineByJieba() {
			const progress = useProgress();
			const p = progress.newProgress("正在进行分词操作");
			const results: LyricLine[] = [];
			const sel = this.lyrics.filter((line) => line.selected).length;
			let cur = 0;
			for (let i = 0; i < this.lyrics.length; i++) {
				const line: LyricLine = {
					...toRaw(this.lyrics[i]),
				};
				if (!line.selected) {
					results.push(line);
					continue;
				}
				const newWords = line.words.flatMap((w) => {
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

				p.label = `正在进行分词操作 (${++cur}/${sel})`;
				p.progress = cur / sel;
				results.push(line);
				if (i % 5 === 0) await waitNextTick();
			}
			p.label = "正在完成";
			await waitNextTick();
			this.lyrics = results;
			progress.finishProgress(p);
			this.record();
		},
	},
	undo: {
		enable: true,
	},
});
