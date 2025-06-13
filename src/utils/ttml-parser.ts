/*
 * Copyright 2023-2025 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

/**
 * @fileoverview
 * 解析 TTML 歌词文档到歌词数组的解析器
 * 用于解析从 Apple Music 来的歌词文件，且扩展并支持翻译和音译文本。
 * @see https://www.w3.org/TR/2018/REC-ttml1-20181108/
 */

import { uid } from "uid";
import { log } from "./logging.ts";
import { parseTimespan } from "./timestamp";
import type {
	LyricLine,
	LyricWord,
	TTMLLyric,
	TTMLMetadata,
} from "./ttml-types";

export function parseLyric(ttmlText: string): TTMLLyric {
	const domParser = new DOMParser();
	const ttmlDoc: XMLDocument = domParser.parseFromString(
		ttmlText,
		"application/xml",
	);

	log("ttml document parsed", ttmlDoc);

	// 处理 Apple Music 样式的翻译
	const itunesTranslations = new Map<string, string>();
	const translationTextElements = ttmlDoc.querySelectorAll(
		"iTunesMetadata > translations > translation > text[for]",
	);

	translationTextElements.forEach((textEl) => {
		const key = textEl.getAttribute("for");
		const translation = textEl.textContent ?? "";
		if (key && translation) {
			itunesTranslations.set(key, translation);
		}
	});


	let mainAgentId = "v1";

	const metadata: TTMLMetadata[] = [];
	for (const meta of ttmlDoc.querySelectorAll("meta")) {
		if (meta.tagName === "amll:meta") {
			const key = meta.getAttribute("key");
			if (key) {
				const value = meta.getAttribute("value");
				if (value) {
					const existing = metadata.find((m) => m.key === key);
					if (existing) {
						existing.value.push(value);
					} else {
						metadata.push({
							key,
							value: [value],
						});
					}
				}
			}
		}
	}

	for (const agent of ttmlDoc.querySelectorAll("ttm\\:agent")) {
		if (agent.getAttribute("type") === "person") {
			const id = agent.getAttribute("xml:id");
			if (id) {
				mainAgentId = id;
				break;
			}
		}
	}

	const lyricLines: LyricLine[] = [];

	function parseParseLine(lineEl: Element, isBG = false, isDuet = false) {
		const line: LyricLine = {
			id: uid(),
			words: [],
			translatedLyric: "",
			romanLyric: "",
			isBG,
			isDuet: isBG
				? isDuet
				: !!lineEl.getAttribute("ttm:agent") &&
				lineEl.getAttribute("ttm:agent") !== mainAgentId,
			startTime: 0,
			endTime: 0,
			ignoreSync: false,
		};
		let haveBg = false;

		const startTime = lineEl.getAttribute("begin");
		const endTime = lineEl.getAttribute("end");

		// 获取 itunes:key 并应用 <head> 中的翻译
		const itunesKey = lineEl.getAttribute("itunes:key");
		if (itunesKey && itunesTranslations.has(itunesKey)) {
			line.translatedLyric = itunesTranslations.get(itunesKey) ?? "";
		}


		for (const wordNode of lineEl.childNodes) {
			if (wordNode.nodeType === Node.TEXT_NODE) {
				const word = wordNode.textContent ?? "";
				line.words.push({
					id: uid(),
					word: word,
					startTime: word.trim().length > 0 ? line.startTime : 0,
					endTime: word.trim().length > 0 ? line.endTime : 0,
					obscene: false,
					emptyBeat: 0,
				});
			} else if (wordNode.nodeType === Node.ELEMENT_NODE) {
				const wordEl = wordNode as Element;
				const role = wordEl.getAttribute("ttm:role");

				if (wordEl.nodeName === "span" && role) {
					if (role === "x-bg") {
						parseParseLine(wordEl, true, line.isDuet);
						haveBg = true;
					} else if (role === "x-translation") {
						// 没有 Apple Music 样式翻译时才使用内嵌翻译
						if (!line.translatedLyric) {
							line.translatedLyric = wordEl.innerHTML;
						}
					} else if (role === "x-roman") {
						line.romanLyric = wordEl.innerHTML;
					}
				} else if (wordEl.hasAttribute("begin") && wordEl.hasAttribute("end")) {
					const word: LyricWord = {
						id: uid(),
						word: wordNode.textContent ?? "",
						startTime: parseTimespan(wordEl.getAttribute("begin") ?? ""),
						endTime: parseTimespan(wordEl.getAttribute("end") ?? ""),
						obscene: false,
						emptyBeat: 0,
					};
					const emptyBeat = wordEl.getAttribute("amll:empty-beat");
					if (emptyBeat) word.emptyBeat = Number(emptyBeat);
					const obscene = wordEl.getAttribute("amll:obscene");
					if (obscene === "true") word.obscene = true;

					line.words.push(word);
				}
			}
		}

		if (startTime && endTime) {
			line.startTime = parseTimespan(startTime);
			line.endTime = parseTimespan(endTime);
		} else {
			line.startTime = line.words
				.filter((w) => w.word.trim().length > 0)
				.reduce(
					(pv, cv) => Math.min(pv, cv.startTime),
					Number.POSITIVE_INFINITY,
				);
			line.endTime = line.words
				.filter((w) => w.word.trim().length > 0)
				.reduce((pv, cv) => Math.max(pv, cv.endTime), 0);
		}

		if (line.isBG) {
			const firstWord = line.words[0];
			if (firstWord?.word?.startsWith("(")) {
				firstWord.word = firstWord.word.substring(1);
				if (firstWord.word.length === 0) {
					line.words.shift();
				}
			}

			const lastWord = line.words[line.words.length - 1];
			if (lastWord?.word?.endsWith(")")) {
				lastWord.word = lastWord.word.substring(0, lastWord.word.length - 1);
				if (lastWord.word.length === 0) {
					line.words.pop();
				}
			}
		}

		if (haveBg) {
			const bgLine = lyricLines.pop();
			lyricLines.push(line);
			if (bgLine) lyricLines.push(bgLine);
		} else {
			lyricLines.push(line);
		}
	}

	for (const lineEl of ttmlDoc.querySelectorAll("body p[begin][end]")) {
		parseParseLine(lineEl);
	}

	log("finished ttml load", lyricLines, metadata);

	return {
		metadata,
		lyricLines: lyricLines,
	};
}
