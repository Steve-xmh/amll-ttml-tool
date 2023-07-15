/**
 * @fileoverview
 * 解析 TTML 歌词文档到歌词数组的解析器
 * 用于解析从 Apple Music 来的歌词文件，且扩展并支持翻译和音译文本。
 * @see https://www.w3.org/TR/2018/REC-ttml1-20181108/
 */

import type { DynamicLyricWord, LyricLine } from "./lyric-types";

const timeRegexp =
	/^(((?<hour>[0-9]+):)?(?<min>[0-9]+):)?(?<sec>[0-9]+([\.:]([0-9]+))?)/;
function parseTimespan(timeSpan: string): number {
	const matches = timeRegexp.exec(timeSpan);
	if (matches) {
		const hour = Number(matches.groups?.hour || "0");
		const min = Number(matches.groups?.min || "0");
		const sec = Number(matches.groups?.sec.replace(/:/, ".") || "0");
		return Math.floor((hour * 3600 + min * 60 + sec) * 1000);
	} else {
		throw new TypeError("时间戳字符串解析失败");
	}
}

export function parseLyric(ttmlText: string): LyricLine[] {
	const domParser = new DOMParser();
	const ttmlDoc: XMLDocument = domParser.parseFromString(
		ttmlText,
		"application/xml",
	);

	console.log(ttmlDoc);

	let mainAgentId = "v1";

	for (const agent of ttmlDoc.querySelectorAll("ttm\\:agent")) {
		if (agent.getAttribute("type") === "person") {
			const id = agent.getAttribute("xml:id");
			if (id) {
				mainAgentId = id;
			}
		}
	}

	const result: LyricLine[] = [];

	for (const lineEl of ttmlDoc.querySelectorAll("body p[begin][end]")) {
		const line = {
			beginTime: parseTimespan(lineEl.getAttribute("begin")!!),
			duration: 0,
			shouldAlignRight:
				!!lineEl.getAttribute("ttm:agent") &&
				lineEl.getAttribute("ttm:agent") !== mainAgentId,
			originalLyric: "",
			dynamicLyric: [],
			dynamicLyricTime: parseTimespan(lineEl.getAttribute("begin")!!),
			isBackgroundLyric: false,
			backgroundLyric: undefined,
			translatedLyric: undefined,
			romanLyric: undefined,
		} as LyricLine;

		line.duration =
			parseTimespan(lineEl.getAttribute("end")!!) - line.beginTime;

		let wordTmp = "";
		for (const wordNode of lineEl.childNodes) {
			if (wordNode.nodeType === Node.TEXT_NODE) {
				line.dynamicLyric?.push({
					word: wordNode.textContent ?? "",
					time: 0,
					duration: 0,
					flag: 0,
				});
			} else if (wordNode.nodeType === Node.ELEMENT_NODE) {
				const wordEl = wordNode as Element;
				const role = wordEl.getAttribute("ttm:role");

				if (wordEl.nodeName === "span" && role) {
					if (role === "x-bg") {
						const bgLine = {
							originalLyric: "",
							translatedLyric: undefined,
							romanLyric: undefined,
							dynamicLyric: [],
							dynamicLyricTime: line.dynamicLyricTime,
							isBackgroundLyric: true,
							beginTime: line.beginTime,
							duration: line.duration,
							shouldAlignRight: line.shouldAlignRight,
						} as LyricLine;

						for (const wordNode of wordEl.childNodes) {
							if (wordNode.nodeType === Node.TEXT_NODE) {
								bgLine.dynamicLyric?.push({
									word: wordNode.textContent ?? "",
									time: 0,
									duration: 0,
									flag: 0,
								});
							} else if (wordNode.nodeType === Node.ELEMENT_NODE) {
								const wordEl = wordNode as Element;
								if (
									wordEl.hasAttribute("begin") &&
									wordEl.hasAttribute("end")
								) {
									wordTmp += wordNode.textContent ?? "";
									const word = {
										word: wordTmp,
										time: parseTimespan(wordEl.getAttribute("begin")!!),
										duration: 0,
										flag: 0,
									} as DynamicLyricWord;
									word.duration =
										parseTimespan(wordEl.getAttribute("end")!!) - word.time;
									wordTmp = "";
									bgLine.dynamicLyric?.push(word);
								}
							}
						}

						const firstWord = bgLine.dynamicLyric?.[0];
						if (firstWord?.word.startsWith("(")) {
							firstWord.word = firstWord.word.substring(1);
						}

						const lastWord =
							bgLine.dynamicLyric?.[bgLine.dynamicLyric.length - 1];
						if (lastWord?.word.endsWith(")")) {
							lastWord.word = lastWord.word.substring(
								0,
								lastWord.word.length - 1,
							);
						}

						for (const bgChildEl of wordEl.children) {
							const role = bgChildEl.getAttribute("ttm:role");
							if (bgChildEl.nodeName === "span" && role) {
								if (role === "x-translation") {
									bgLine.translatedLyric = bgChildEl.innerHTML.trim();
								} else if (role === "x-roman") {
									bgLine.romanLyric = bgChildEl.innerHTML.trim();
								}
							}
						}

						if (bgLine.dynamicLyric?.length === 0) {
							bgLine.originalLyric = "";
							for (const childNode of wordEl.childNodes) {
								if (childNode.nodeType === Node.TEXT_NODE) {
									bgLine.originalLyric += childNode.nodeValue ?? "";
								}
							}
							bgLine.originalLyric = bgLine.originalLyric.trim();
							bgLine.dynamicLyric = undefined;
							bgLine.dynamicLyricTime = undefined;
						} else if (line.dynamicLyric) {
							bgLine.originalLyric =
								bgLine.dynamicLyric?.reduce((pv, cv) => pv + cv.word, "") || "";
						}

						line.backgroundLyric = bgLine;
					} else if (role === "x-translation") {
						line.translatedLyric = wordEl.innerHTML;
					} else if (role === "x-roman") {
						line.romanLyric = wordEl.innerHTML;
					}
				} else if (wordEl.hasAttribute("begin") && wordEl.hasAttribute("end")) {
					const word = {
						word: wordNode.textContent ?? "",
						time: parseTimespan(wordEl.getAttribute("begin")!!),
						duration: 0,
						flag: 0,
					} satisfies DynamicLyricWord;
					word.duration =
						parseTimespan(wordEl.getAttribute("end")!!) - word.time;
					wordTmp = "";
					line.dynamicLyric?.push(word);
				}
			}
		}

		if (line.dynamicLyric?.length === 0) {
			line.originalLyric = "";
			for (const childNode of lineEl.childNodes) {
				if (childNode.nodeType === Node.TEXT_NODE) {
					line.originalLyric += childNode.textContent;
				}
			}
			line.originalLyric = line.originalLyric.trim();
			line.dynamicLyric = undefined;
			line.dynamicLyricTime = undefined;
		} else if (line.dynamicLyric) {
			line.originalLyric = line.dynamicLyric.reduce(
				(pv, cv) => pv + cv.word,
				"",
			);
		}

		result.push(line);
		if (line.backgroundLyric) {
			result.push(line.backgroundLyric);
		}
	}

	console.log(result);

	return result;
}
