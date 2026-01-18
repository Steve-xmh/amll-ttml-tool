/**
 * @description 分词引擎
 */

import { type LyricWord, newLyricWord } from "$/types/ttml";
import { CharType, type SegmentationConfig } from "../types";

const RE_WHITESPACE = /[\s\n\t]/;
const RE_LATIN =
	/[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}\p{M}'-]/u;
const RE_NUMERIC = /[0-9]/;

/**
 * @description 判断单个字符的类型
 */
function getCharType(c: string): CharType {
	if (!c || c.trim() === "") {
		return CharType.Whitespace;
	}
	const code = c.charCodeAt(0);

	if (RE_WHITESPACE.test(c)) return CharType.Whitespace;
	if (RE_LATIN.test(c)) return CharType.Latin;
	if (RE_NUMERIC.test(c)) return CharType.Numeric;

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
 * @description 判断两个相邻字符是否应该合并
 */
function isMergeablePair(
	prev: CharType,
	curr: CharType,
	splitCJK: boolean,
): boolean {
	if (prev !== curr) {
		return false;
	}

	switch (prev) {
		case CharType.Latin:
		case CharType.Numeric:
		case CharType.Whitespace:
			return true;
		case CharType.Cjk:
			return !splitCJK;
		default:
			return false;
	}
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
			currentToken.length > 1 &&
			config.hyphenator
		) {
			const syllables = config.hyphenator(currentToken).split("\u00AD");
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
				!isMergeablePair(lastCharType, currentCharType, config.splitCJK)
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
 * @description 标点符号的结合方向
 */
enum MergeDirection {
	Left,
	Right,
}

const rightAssociativeChars = new Set([
	"(",
	"[",
	"{",
	"<",
	"（",
	"【",
	"《",
	"「",
	"『",
	"“",
	"‘",
	"¿",
	"¡",
]);

/**
 * @description 判断标点符号应该向哪个方向合并
 */
function getMergeDirection(text: string): MergeDirection {
	const firstChar = text.trim().charAt(0);

	if (rightAssociativeChars.has(firstChar)) {
		return MergeDirection.Right;
	}

	// 句号、逗号、右括号等其他所有标点向左合并
	return MergeDirection.Left;
}

/**
 * @description 后处理
 *
 * 处理标点粘连，过滤空字符，计算总权重
 * @returns 处理完的 Token 列表、对应的权重列表、总权重
 */
function postProcess(
	tokens: string[],
	config: SegmentationConfig,
): { finalTokens: string[]; finalWeights: number[]; totalWeight: number } {
	const processedTokens: string[] = [];
	const tokenWeights: number[] = [];

	/**
	 * @description 用于存储等待向右合并的标点。例如 `(`
	 */
	let pendingPrefix = "";
	let pendingPrefixWeight = 0;

	for (const token of tokens) {
		const tokenWeight = calculateWeight(token, config);
		const firstChar = token.length > 0 ? Array.from(token)[0] : " ";
		const charType = getCharType(firstChar);

		if (config.punctuationMode === "merge" && charType === CharType.Other) {
			const direction = getMergeDirection(token);

			if (direction === MergeDirection.Right) {
				// 向右合并
				pendingPrefix += token;
				pendingPrefixWeight += tokenWeight;
			} else {
				// 向左合并
				if (processedTokens.length > 0) {
					processedTokens[processedTokens.length - 1] += token;
					tokenWeights[tokenWeights.length - 1] += tokenWeight;
				} else {
					// 行首就是应该向左合并的标点符号，存起来然后合并到第一个音节中
					pendingPrefix += token;
					pendingPrefixWeight += tokenWeight;
				}
			}
		} else {
			// 实词，将缓冲区的标点拼接在词前
			const combinedToken = pendingPrefix + token;
			const combinedWeight = pendingPrefixWeight + tokenWeight;

			processedTokens.push(combinedToken);
			tokenWeights.push(combinedWeight);

			pendingPrefix = "";
			pendingPrefixWeight = 0;
		}
	}

	// 行尾缓冲区里还有应该向右合并的标点，拼接到上一个词中
	if (pendingPrefix) {
		if (processedTokens.length > 0) {
			processedTokens[processedTokens.length - 1] += pendingPrefix;
			tokenWeights[tokenWeights.length - 1] += pendingPrefixWeight;
		} else {
			// 整行都只有标点了
			processedTokens.push(pendingPrefix);
			tokenWeights.push(pendingPrefixWeight);
		}
	}

	// 权重计算
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
 * @description 把原 `LyricWord` 的总时长按权重分给切分后的 `tokens`
 * @param originalWord 原始的大词对象
 * @param tokens 切分后的文本数组
 * @param weights 对应的权重数组
 * @param totalWeight 总权重
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
 *
 * 防治字符串里的特殊符号搞崩正则
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

/**
 * 手动分词的时间重计算
 *
 * 用于当已经有了手动指定的分词结果，需要重新计算时间戳时
 *
 * 一个典型应用是拆分单词对话框里的手动分词
 */
export function recalculateWordTime(
	originalWord: LyricWord,
	segments: string[],
	config: SegmentationConfig,
): LyricWord[] {
	const weights = segments.map((token) => calculateWeight(token, config));
	const totalWeight = weights.reduce((sum, w) => sum + w, 0);

	return distributeTime(originalWord, segments, weights, totalWeight);
}
