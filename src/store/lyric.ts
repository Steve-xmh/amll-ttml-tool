/*
 * Copyright 2023-2024 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import type {LyricLine as CoreLyricLine} from "@applemusic-like-lyrics/core";
import {
	type LyricLine as WasmLyricLine,
	parseEslrc,
	parseLrc,
	parseLys,
	parseQrc,
	parseYrc,
	stringifyAss,
	stringifyEslrc,
	stringifyLrc,
	stringifyLys,
	stringifyQrc,
	stringifyYrc,
} from "@applemusic-like-lyrics/lyric";
import structuredClone from "@ungap/structured-clone";
import {defineStore} from "pinia";
import {toRaw} from "vue";
import {i18n} from "../i18n";
import {waitNextTick} from "../utils";
import {parseLyric} from "../utils/ttml-parser";
import type {LyricLine, LyricWord, TTMLMetadata} from "../utils/ttml-types";
import exportTTMLText from "../utils/ttml-writer";
import {useProgress} from "./progress";

export interface LyricWordWithId extends LyricWord {
	lineIndex: number;
	id: number;
}

export interface LyricLineWithState extends LyricLine {
	selected: boolean;
}

export interface LyricLineWithId extends LyricLineWithState {
	words: LyricWordWithId[];
	id: number;
}

function mapFromWasmLyric(line: WasmLyricLine): LyricLineWithState {
	return {
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
		startTime: line.words.reduce(
			(pv, cv) => Math.min(pv, cv.startTime),
			Number.MAX_VALUE,
		),
		endTime: line.words.reduce(
			(pv, cv) => Math.max(pv, cv.endTime),
			Number.MIN_VALUE,
		),
	};
}

export const useEditingLyric = defineStore("editing-lyric", {
	state: () => ({
		artists: [] as string[],
		lyrics: [] as LyricLineWithState[],
		metadata: [] as TTMLMetadata[],
	}),
	undo: {
		enable: true,
	},
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
			this.metadata = [];
			this.record();
		},
		isDirty() {
			return (
				this.artists.length > 0 ||
				this.lyrics.length > 0 ||
				this.metadata.length > 0
			);
		},
		loadLyric(ttmlLyric: ReturnType<typeof parseLyric>) {
			this.artists = [];
			this.lyrics = ttmlLyric.lyricLines.map((line) => ({
				...line,
				selected: false,
			}));
			this.metadata = ttmlLyric.metadata;
			this.record();
		},
		loadLRC(lyric: string) {
			this.artists = [];
			this.lyrics = parseLrc(lyric).map(mapFromWasmLyric);
			this.metadata = [];
			this.record();
		},
		loadESLRC(lyric: string) {
			this.artists = [];
			this.lyrics = parseEslrc(lyric).map(mapFromWasmLyric);
			this.metadata = [];
			this.record();
		},
		loadYRC(lyric: string) {
			this.artists = [];
			this.lyrics = parseYrc(lyric).map(mapFromWasmLyric);
			this.metadata = [];
			this.record();
		},
		loadQRC(lyric: string) {
			this.artists = [];
			this.lyrics = parseQrc(lyric).map(mapFromWasmLyric);
			this.metadata = [];
			this.record();
		},
		loadLYS(lyric: string) {
			this.artists = [];
			this.lyrics = parseLys(lyric).map(mapFromWasmLyric);
			this.metadata = [];
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
				startTime: 0,
				endTime: 0,
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
				startTime: 0,
				endTime: 0,
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
			for (const line of this.lyrics) {
				line.selected = true;
			}
		},
		unselectAllLine() {
			for (const line of this.lyrics) {
				line.selected = false;
			}
		},
		invertSelectAllLine() {
			for (const line of this.lyrics) {
				line.selected = !line.selected;
			}
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
		modifyWordEmptyBeat(
			lineIndex: number,
			wordIndex: number,
			newEmptyBeat: number,
		) {
			if (this.lyrics[lineIndex]) {
				if (this.lyrics[lineIndex].words[wordIndex]) {
					this.lyrics[lineIndex].words[wordIndex].emptyBeat =
						newEmptyBeat === 0 ? undefined : newEmptyBeat;
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
			for (const line of this.lyrics) {
				if (line.selected) line.isBG = hasNoBg;
			}
		},
		toggleSelectedLineDuet() {
			const hasNoDuet =
				this.lyrics.filter((line) => line.selected && !line.isDuet).length > 0;
			for (const line of this.lyrics) {
				if (line.selected) line.isDuet = hasNoDuet;
			}
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
		roundTimeStamps() {
			for (const line of this.lyrics) {
				line.startTime = Math.round(line.startTime);
				line.endTime = Math.round(line.endTime);
				for (const word of line.words) {
					word.startTime = Math.round(word.startTime);
					word.endTime = Math.round(word.endTime);
					if (word.emptyBeat !== undefined) word.emptyBeat = Math.round(word.emptyBeat);
				}
			}
		},
		toTTML() {
			this.roundTimeStamps();
			const transformed: LyricLine[] = [];

			for (let i = 0; i < this.lyrics.length; i++) {
				const line = this.lyrics[i];
				if (line.isBG) {
					const lastLine = this.lyrics[i - 1];
					if (lastLine?.isBG) {
						throw new TypeError(
							`第 ${i} 行背景人声歌词重复，每行普通歌词只能拥有一个背景人声歌词`,
						);
					}
				}
				transformed.push(toRaw(this.lyrics[i]));
			}

			console.log(structuredClone(transformed));

			return exportTTMLText({
				lyricLines: transformed,
				metadata: toRaw(this.metadata),
			});
		},
		toLRC() {
			this.roundTimeStamps();
			const lines = toRaw(this.lyrics);
			return stringifyLrc(lines);
		},
		toESLRC() {
			this.roundTimeStamps();
			const lines = toRaw(this.lyrics);
			return stringifyEslrc(lines);
		},
		toYRC() {
			this.roundTimeStamps();
			const lines = toRaw(this.lyrics);
			return stringifyYrc(lines);
		},
		toQRC() {
			this.roundTimeStamps();
			const lines = toRaw(this.lyrics);
			return stringifyQrc(lines);
		},
		toLYS() {
			this.roundTimeStamps();
			const lines = toRaw(this.lyrics);
			return stringifyLys(lines);
		},
		toASS() {
			this.roundTimeStamps();
			const lines = toRaw(this.lyrics);
			return stringifyAss(lines);
		},
		splitLineBySimpleMethod() {
			const rawLines: LyricLineWithState[] = this.lyrics.map((line) => ({
				...toRaw(line),
				words: toRaw(line.words).map((w) => ({ ...w })),
			}));
			const results: LyricLineWithState[] = [];
			const latinReg = /^[A-z\u00C0-\u00ff'.,-\/#!$%^&*;:{}=\-_`~()]+$/;

			for (const line of rawLines) {

				const chars = line.words.flatMap((w) => w.word.split(""));
				console.log(chars);
				const wordsResult: LyricWord[] = [];
				let tmpWord: LyricWord = {
					word: "",
					startTime: 0,
					endTime: 0,
				};
				for (const c of chars) {
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
				}
				if (tmpWord.word.length > 0) {
					wordsResult.push(tmpWord);
				}
				results.push({
					...line,
					words: wordsResult,
					selected: false,
				});
			}

			console.log(results);

			this.lyrics = results;
			this.record();
		},
		async splitLineByJieba() {
			const progress = useProgress();
			const p = progress.newProgress(
				i18n.global.t("progressOverlay.processingWordSpliting"),
			);
			const results: LyricLineWithState[] = [];
			const sel = this.lyrics.filter((line) => line.selected).length;
			let cur = 0;
			p.label = i18n.global.t("progressOverlay.loadingJiebaModule");
			const { cut } = await import("jieba-rs-wasm");
			for (let i = 0; i < this.lyrics.length; i++) {
				const line: LyricLineWithState = {
					...toRaw(this.lyrics[i]),
				};
				if (!line.selected) {
					results.push(line);
					continue;
				}
				line.words = line.words.flatMap((w) => {
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
});
