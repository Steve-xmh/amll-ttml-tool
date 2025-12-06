/**
 * @description 分词引擎
 */

import { hyphenateSync } from "hyphen/en-us";
import { type LyricWord, newLyricWord } from "$/utils/ttml-types.ts";
import { CharType, type SegmentationConfig } from "./segmentation-types";

/**
 * @description 判断单个字符的类型
 */
function getCharType(c: string): CharType {
	if (!c || c.trim() === "") {
		return CharType.Whitespace;
	}
	const code = c.charCodeAt(0);

	if (c.match(/[\s\n\t]/)) {
		return CharType.Whitespace;
	}
	if (c.match(/[a-zA-Z'-]/)) {
		return CharType.Latin;
	}
	if (c.match(/[0-9]/)) {
		return CharType.Numeric;
	}
	if (
		(code >= 0x4e00 && code <= 0x9fff) || // CJK
		(code >= 0x3040 && code <= 0x309f) || // 日语平假名
		(code >= 0x30a0 && code <= 0x30ff) || // 日语片假名
		(code >= 0xac00 && code <= 0xd7af) // 韩语
	) {
		return CharType.Cjk;
	}
	// 标点符号和emoji等
	return CharType.Other;
}

/**
 * @description 自动将一个字符串拆分为 token
 */
function autoTokenize(text: string, config: SegmentationConfig): string[] {
	if (!text) {
		return [];
	}
	const tokens: string[] = [];
	let currentToken = "";
	let lastCharType: CharType | null = null;

	const pushCurrentToken = () => {
		if (!currentToken) return;

		if (
			lastCharType === CharType.Latin &&
			config.splitEnglish &&
			currentToken.length > 1
		) {
			const syllables = hyphenateSync(currentToken).split("\u00AD");
			tokens.push(...syllables);
		} else {
			tokens.push(currentToken);
		}
		currentToken = "";
	};

	const graphemes = Array.from(text);

	for (const grapheme of graphemes) {
		const firstChar = grapheme.length > 0 ? Array.from(grapheme)[0] : " ";
		const currentCharType = getCharType(firstChar);

		if (lastCharType !== null) {
			let shouldBreak = false;

			if (currentCharType === CharType.Cjk && config.splitCJK) {
				shouldBreak = true;
			} else if (lastCharType === CharType.Cjk && config.splitCJK) {
				shouldBreak = true;
			} else if (currentCharType === CharType.Other) {
				shouldBreak = true;
			} else if (lastCharType === CharType.Other) {
				shouldBreak = true;
			}

			if (
				!shouldBreak &&
				!matches(
					[lastCharType, currentCharType],
					[
						[CharType.Latin, CharType.Latin],
						[CharType.Numeric, CharType.Numeric],
						[CharType.Whitespace, CharType.Whitespace],

						[!config.splitCJK, CharType.Cjk, CharType.Cjk],
					],
				)
			) {
				shouldBreak = true;
			}

			if (shouldBreak && currentToken) {
				pushCurrentToken();
			}
		}

		currentToken += grapheme;
		lastCharType = currentCharType;
	}

	pushCurrentToken();

	return tokens;
}

/**
 * @description 辅助函数，用于模式匹配
 */
function matches(
	current: [CharType, CharType],
	patterns: (boolean | CharType)[][],
): boolean {
	for (const pattern of patterns) {
		if (pattern.length === 2) {
			if (pattern[0] === current[0] && pattern[1] === current[1]) {
				return true;
			}
		} else if (pattern.length === 3) {
			// 用于 [!config.splitCJK, ...] 这种模式
			if (
				pattern[0] &&
				pattern[1] === current[0] &&
				pattern[2] === current[1]
			) {
				return true;
			}
		}
	}
	return false;
}

function calculateWeight(token: string, config: SegmentationConfig): number {
	if (!token) {
		return 0;
	}
	const firstChar = token.length > 0 ? Array.from(token)[0] : " ";
	const charType = getCharType(firstChar);

	switch (charType) {
		case CharType.Latin:
		case CharType.Numeric:
		case CharType.Cjk:
			return token.length;
		case CharType.Other:
			return config.punctuationWeight;
		case CharType.Whitespace:
			return 0.0;
		default:
			return 0.0;
	}
}

/**
 * @description 后处理
 */
function postProcess(
	tokens: string[],
	config: SegmentationConfig,
): { finalTokens: string[]; finalWeights: number[]; totalWeight: number } {
	const processedTokens: string[] = [];
	const tokenWeights: number[] = [];

	for (const token of tokens) {
		const tokenWeight = calculateWeight(token, config);
		const firstChar = token.length > 0 ? Array.from(token)[0] : " ";
		const charType = getCharType(firstChar);

		if (
			config.punctuationMode === "merge" &&
			charType === CharType.Other &&
			processedTokens.length > 0
		) {
			processedTokens[processedTokens.length - 1] += token;
			tokenWeights[tokenWeights.length - 1] += tokenWeight;
		} else {
			processedTokens.push(token);
			tokenWeights.push(tokenWeight);
		}
	}

	const finalTokens: string[] = [];
	const finalWeights: number[] = [];
	let totalWeight = 0;

	for (let i = 0; i < processedTokens.length; i++) {
		const token = processedTokens[i];
		const weight = tokenWeights[i];

		if (token === "" && config.removeEmptySegments) {
			continue;
		}

		finalTokens.push(token);
		finalWeights.push(weight);
		totalWeight += weight;
	}

	return { finalTokens, finalWeights, totalWeight };
}

/**
 * @description 分配时长
 */
function distributeTime(
	originalWord: LyricWord,
	tokens: string[],
	weights: number[],
	totalWeight: number,
): LyricWord[] {
	if (tokens.length === 0) {
		return [];
	}
	if (tokens.length === 1) {
		return [{ ...originalWord, word: tokens[0] }];
	}

	const totalDuration = originalWord.endTime - originalWord.startTime;
	if (totalDuration <= 0) {
		return tokens.map((token) => ({
			...newLyricWord(),
			word: token,
			startTime: originalWord.startTime,
			endTime: originalWord.endTime,
		}));
	}

	if (totalWeight <= 0) {
		return [];
	}

	const durationPerWeight = totalDuration / totalWeight;
	const newWords: LyricWord[] = [];
	let currentTokenStartMs = originalWord.startTime;

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const weight = weights[i];

		const tokenDuration = Math.round(weight * durationPerWeight);
		let tokenEndMs = currentTokenStartMs + tokenDuration;

		if (i === tokens.length - 1) {
			tokenEndMs = originalWord.endTime;
		}

		newWords.push({
			...newLyricWord(),
			word: token,
			startTime: currentTokenStartMs,
			endTime: tokenEndMs,
		});

		if (tokenEndMs > currentTokenStartMs) {
			currentTokenStartMs = tokenEndMs;
		}
	}

	return newWords;
}

/**
 * @description 转义正则特殊字符
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @description 将单个 LyricWord 拆分为多个
 */
export function segmentWord(
	word: LyricWord,
	config: SegmentationConfig,
): LyricWord[] {
	const protectedWords = new Set([
		...config.ignoreList,
		...config.customRules.keys(),
	]);

	if (protectedWords.size === 0) {
		const tokens = autoTokenize(word.word, config);
		if (tokens.length === 0) return [];
		const { finalTokens, finalWeights, totalWeight } = postProcess(
			tokens,
			config,
		);
		return distributeTime(word, finalTokens, finalWeights, totalWeight);
	}

	const sortedPatterns = Array.from(protectedWords)
		.filter((k) => k.trim() !== "")
		.sort((a, b) => b.length - a.length)
		.map(escapeRegExp);

	if (sortedPatterns.length === 0) {
		const tokens = autoTokenize(word.word, config);
		if (tokens.length === 0) return [];
		const { finalTokens, finalWeights, totalWeight } = postProcess(
			tokens,
			config,
		);
		return distributeTime(word, finalTokens, finalWeights, totalWeight);
	}

	const pattern = new RegExp(`(${sortedPatterns.join("|")})`, "g");

	const parts = word.word.split(pattern);

	const allTokens: string[] = [];
	const allWeights: number[] = [];
	let grandTotalWeight = 0;

	for (const part of parts) {
		if (!part) continue;

		if (config.customRules.has(part)) {
			const ruleParts = config.customRules.get(part);
			if (!ruleParts) continue;
			for (const token of ruleParts) {
				const weight = calculateWeight(token, config);
				allTokens.push(token);
				allWeights.push(weight);
				grandTotalWeight += weight;
			}
		} else if (config.ignoreList.has(part)) {
			const weight = calculateWeight(part, config);
			allTokens.push(part);
			allWeights.push(weight);
			grandTotalWeight += weight;
		} else {
			const tokens = autoTokenize(part, config);
			const { finalTokens, finalWeights, totalWeight } = postProcess(
				tokens,
				config,
			);
			allTokens.push(...finalTokens);
			allWeights.push(...finalWeights);
			grandTotalWeight += totalWeight;
		}
	}

	return distributeTime(word, allTokens, allWeights, grandTotalWeight);
}
