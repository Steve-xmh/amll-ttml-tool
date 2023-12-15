import { defineStore } from "pinia";
import { parseLyric } from "../utils/ttml-lyric-parser";
import { toRaw } from "vue";
import exportTTMLText from "../utils/ttml-writer";
import type { LyricLine as RawLyricLine } from "../utils/lyric-types";
import type { LyricLine as CoreLyricLine } from "@applemusic-like-lyrics/core";
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
	stringifyAss,
	parseEslrc,
	stringifyEslrc,
} from "@applemusic-like-lyrics/lyric";
import { i18n } from "../i18n";

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
	isBG: boolean;
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
		lineForPreview: (state): CoreLyricLine[] =>
			state.lyrics.map((l) => ({
				startTime: l.words?.[0]?.startTime ?? 0,
				endTime: l.words?.[l.words.length - 1]?.endTime ?? 0,
				words: l.words.map((w) => ({
					startTime: w.startTime,
					endTime: w.endTime,
					word: w.word,
				})),
				isBG: l.isBG,
				isDuet: l.isDuet,
				romanLyric: l.romanLyric,
				translatedLyric: l.translatedLyric,
			})),
		hasLineWithMoreWords: (state) =>
			!!state.lyrics.find((line) => line.words.length > 1),
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
				isBG: !!line.isBackgroundLyric,
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
				isBG: false,
				isDuet: false,
				selected: false,
			}));
			this.record();
		},
		loadESLRC(lyric: string) {
			this.artists = [];
			this.lyrics = parseEslrc(lyric).map((line) => ({
				words: line.words.map((w) => ({
					startTime: w.startTime,
					endTime: w.endTime,
					word: w.word,
				})),
				translatedLyric: "",
				romanLyric: "",
				isBG: false,
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
				isBG: false,
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
				isBG: false,
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
				isBG: !!line.isBG,
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
				isBG: false,
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
				isBG: false,
				isDuet: false,
				selected: false,
			});
			this.record();
		},
		reorderWord(lineIndex: number, oldIndex: number, newIndex: number) {
			const line = this.lyrics[lineIndex];
			if (line?.words[oldIndex]) {
				const word = line.words.splice(oldIndex, 1)[0];
				line.words.splice(newIndex, 0, word);
				this.record();
			}
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
				this.lyrics.filter((line) => line.selected && !line.isBG).length > 0;
			this.lyrics.forEach((line) => {
				if (line.selected) line.isBG = hasNoBg;
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
				if (line.words.length === 1 && !this.hasLineWithMoreWords) {
					return {
						originalLyric: line.words[0].word,
						beginTime: line.words[0].startTime,
						duration: line.words[0].endTime - line.words[0].startTime,
						translatedLyric: line.translatedLyric,
						romanLyric: line.romanLyric,
						shouldAlignRight: line.isDuet,
					};
				} else if (line.words.length !== 0) {
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
				} else {
					return {
						originalLyric: "",
						beginTime: 0,
						duration: 0,
						translatedLyric: line.translatedLyric,
						romanLyric: line.romanLyric,
						shouldAlignRight: line.isDuet,
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
				if (line.isBG) {
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
		toESLRC() {
			const lines = toRaw(this.lyrics);
			return stringifyEslrc(lines);
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
		toASS() {
			const lines = toRaw(this.lyrics);
			return stringifyAss(lines);
		},
		splitLineBySimpleMethod() {
			const rawLines: LyricLine[] = this.lyrics.map((line) => ({
				...toRaw(line),
				words: toRaw(line.words).map((w) => ({ ...w })),
			}));
			const results: LyricLine[] = [];
			const latinReg = /^[A-z\u00C0-\u00ff'\.,-\/#!$%\^&\*;:{}=\-_`~()]+$/;

			rawLines.forEach((line) => {
				const chars = line.words.flatMap((w) => w.word.split(""));
				console.log(chars);
				const wordsResult: LyricWord[] = [];
				let tmpWord: LyricWord = {
					word: "",
					startTime: 0,
					endTime: 0,
				};
				chars.forEach((c) => {
					if (/^\s+$/.test(c)) {
						if (tmpWord.word.trim().length > 0) {
							wordsResult.push(tmpWord);
						}
						tmpWord = {
							word: " ",
							startTime: 0,
							endTime: 0,
						};
					} else if (latinReg.test(c)) {
						if (latinReg.test(tmpWord.word)) {
							tmpWord.word += c;
						} else {
							if (tmpWord.word.length > 0) {
								wordsResult.push(tmpWord);
							}
							tmpWord = {
								word: c,
								startTime: 0,
								endTime: 0,
							};
						}
					} else {
						if (tmpWord.word.length > 0) {
							wordsResult.push(tmpWord);
						}
						tmpWord = {
							word: c,
							startTime: 0,
							endTime: 0,
						};
					}
				});
				if (tmpWord.word.length > 0) {
					wordsResult.push(tmpWord);
				}
				results.push({
					...line,
					words: wordsResult,
				});
			});

			console.log(results);

			this.lyrics = results;
			this.record();
		},
		async splitLineByJieba() {
			const progress = useProgress();
			const p = progress.newProgress(
				i18n.global.t("progressOverlay.processingWordSpliting"),
			);
			const results: LyricLine[] = [];
			const sel = this.lyrics.filter((line) => line.selected).length;
			let cur = 0;
			p.label = i18n.global.t("progressOverlay.loadingJiebaModule");
			const { cut } = await import("jieba-rs-wasm");
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

				// p.label = `正在进行分词操作 (${++cur}/${sel})`;
				p.label = i18n.global.t("progressOverlay.splitingWords", [++cur, sel]);
				p.progress = cur / sel;
				results.push(line);
				if (i % 5 === 0) await waitNextTick();
			}
			p.label = i18n.global.t("progressOverlay.finishing");
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
