/*
 * Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
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
 * 用于将内部歌词数组对象导出成 TTML 格式的模块
 * 但是可能会有信息会丢失
 */

import type { LyricLine } from "./lyric-types";

function msToTimestamp(timeMS: number): string {
	if (timeMS === Infinity) {
		return "99:99.999";
	}
	timeMS = timeMS / 1000;
	const secs = timeMS % 60;
	timeMS = (timeMS - secs) / 60;
	const mins = timeMS % 60;
	const hrs = (timeMS - mins) / 60;

	const h = hrs.toString().padStart(2, "0");
	const m = mins.toString().padStart(2, "0");
	const s = secs.toFixed(3).padStart(6, "0");

	if (hrs > 0) {
		return `${h}:${m}:${s}`;
	} else {
		return `${m}:${s}`;
	}
}

export default function exportTTMLText(
	lyric: LyricLine[],
	pretty = false,
): string {
	const params: LyricLine[][] = [];

	let tmp: LyricLine[] = [];
	for (const line of lyric) {
		if (line.originalLyric.length === 0 && tmp.length > 0) {
			params.push(tmp);
			tmp = [];
		} else {
			tmp.push(line);
		}
	}

	if (tmp.length > 0) {
		params.push(tmp);
	}

	const doc = new Document();

	const ttRoot = doc.createElement("tt");

	ttRoot.setAttribute("xmlns", "http://www.w3.org/ns/ttml");
	ttRoot.setAttribute("xmlns:ttm", "http://www.w3.org/ns/ttml#metadata");
	ttRoot.setAttribute(
		"xmlns:itunes",
		"http://music.apple.com/lyric-ttml-internal",
	);

	doc.appendChild(ttRoot);

	const head = doc.createElement("head");

	ttRoot.appendChild(head);

	const body = doc.createElement("body");
	const hasOtherPerson = !!lyric.find((v) => v.shouldAlignRight);

	const metadata = doc.createElement("metadata");
	const mainPersonAgent = doc.createElement("ttm:agent");
	mainPersonAgent.setAttribute("type", "person");
	mainPersonAgent.setAttribute("xml:id", "v1");

	metadata.appendChild(mainPersonAgent);

	if (hasOtherPerson) {
		const otherPersonAgent = doc.createElement("ttm:agent");
		otherPersonAgent.setAttribute("type", "other");
		otherPersonAgent.setAttribute("xml:id", "v2");

		metadata.appendChild(otherPersonAgent);
	}

	head.appendChild(metadata);

	const guessDuration =
		(lyric[lyric.length - 1]?.beginTime ?? 0) +
		(lyric[lyric.length - 1]?.duration ?? 0);
	body.setAttribute("dur", msToTimestamp(guessDuration));

	for (const param of params) {
		const paramDiv = doc.createElement("div");
		const beginTime = param[0]?.beginTime ?? 0;
		const endTime =
			(param[param.length - 1]?.beginTime ?? 0) +
			(param[param.length - 1]?.duration ?? 0);

		paramDiv.setAttribute("begin", msToTimestamp(beginTime));
		paramDiv.setAttribute("end", msToTimestamp(endTime));

		let i = 0;

		for (const line of param) {
			const lineP = doc.createElement("p");
			const beginTime = line.beginTime ?? 0;
			const endTime = line.beginTime + line.duration;

			lineP.setAttribute("begin", msToTimestamp(beginTime));
			lineP.setAttribute("end", msToTimestamp(endTime));

			lineP.setAttribute("ttm:agent", line.shouldAlignRight ? "v2" : "v1");
			lineP.setAttribute("itunes:key", `L${++i}`);

			if (line.dynamicLyric && line.dynamicLyricTime !== undefined) {
				let beginTime = Infinity;
				let endTime = 0;
				for (const word of line.dynamicLyric) {
					if (word.word.trim().length === 0) {
						lineP.appendChild(doc.createTextNode(word.word));
					} else {
						const span = doc.createElement("span");
						span.setAttribute("begin", msToTimestamp(word.time));
						span.setAttribute("end", msToTimestamp(word.time + word.duration));
						span.appendChild(doc.createTextNode(word.word));
						lineP.appendChild(span);
						beginTime = Math.min(beginTime, word.time);
						endTime = Math.max(endTime, word.time + word.duration);
					}
				}
				lineP.setAttribute("begin", msToTimestamp(beginTime));
				lineP.setAttribute("end", msToTimestamp(endTime));
			} else {
				lineP.appendChild(doc.createTextNode(line.originalLyric));
			}

			if (line.backgroundLyric) {
				const bgLine = line.backgroundLyric;
				const bgLineSpan = doc.createElement("span");
				bgLineSpan.setAttribute("ttm:role", "x-bg");

				if (bgLine.dynamicLyric && bgLine.dynamicLyricTime !== undefined) {
					let beginTime = 0;
					let endTime = 0;
					for (const word of bgLine.dynamicLyric) {
						if (word.word.trim().length === 0) {
							bgLineSpan.appendChild(doc.createTextNode(word.word));
						} else {
							const span = doc.createElement("span");
							span.setAttribute("begin", msToTimestamp(word.time));
							span.setAttribute(
								"end",
								msToTimestamp(word.time + word.duration),
							);
							span.appendChild(doc.createTextNode(word.word));
							bgLineSpan.appendChild(span);
							beginTime = Math.min(beginTime, word.time);
							endTime = Math.max(endTime, word.time + word.duration);
						}
					}
				} else {
					bgLineSpan.appendChild(doc.createTextNode(bgLine.originalLyric));
				}

				if (bgLine.translatedLyric) {
					const span = doc.createElement("span");
					span.setAttribute("ttm:role", "x-translation");
					span.setAttribute("xml:lang", "zh-CN");
					span.appendChild(doc.createTextNode(bgLine.translatedLyric));
					bgLineSpan.appendChild(span);
				}

				if (bgLine.romanLyric) {
					const span = doc.createElement("span");
					span.setAttribute("ttm:role", "x-roman");
					span.appendChild(doc.createTextNode(bgLine.romanLyric));
					bgLineSpan.appendChild(span);
				}

				lineP.appendChild(bgLineSpan);
			}

			if (line.translatedLyric) {
				const span = doc.createElement("span");
				span.setAttribute("ttm:role", "x-translation");
				span.setAttribute("xml:lang", "zh-CN");
				span.appendChild(doc.createTextNode(line.translatedLyric));
				lineP.appendChild(span);
			}

			if (line.romanLyric) {
				const span = doc.createElement("span");
				span.setAttribute("ttm:role", "x-roman");
				span.appendChild(doc.createTextNode(line.romanLyric));
				lineP.appendChild(span);
			}

			paramDiv.appendChild(lineP);
		}

		body.appendChild(paramDiv);
	}

	ttRoot.appendChild(body);

	if (pretty) {
		const xsltDoc = new DOMParser().parseFromString(
			[
				'<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
				'  <xsl:strip-space elements="*"/>',
				'  <xsl:template match="para[content-style][not(text())]">',
				'    <xsl:value-of select="normalize-space(.)"/>',
				"  </xsl:template>",
				'  <xsl:template match="node()|@*">',
				'    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
				"  </xsl:template>",
				'  <xsl:output indent="yes"/>',
				"</xsl:stylesheet>",
			].join("\n"),
			"application/xml",
		);

		const xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(xsltDoc);
		const resultDoc = xsltProcessor.transformToDocument(doc);

		return new XMLSerializer().serializeToString(resultDoc);
	} else {
		return new XMLSerializer().serializeToString(doc);
	}
}
