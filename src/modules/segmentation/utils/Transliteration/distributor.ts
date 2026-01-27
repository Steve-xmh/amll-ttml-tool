/**
 * @fileoverview 实现将整行罗马音智能分配给逐个歌词单词的核心算法
 * 特别感谢 Xionghaizi001 实现的算法
 */

import type { LyricWord } from "$/types/ttml";
import {
	getDictionaryRomaji,
	isChoonpu,
	isKanaOnly,
	isPunctuationOnly,
	isSokuon,
	ROMAJI_VOWELS,
	shouldApplyDictionaryFallback,
} from "./TransliterationUtils";
import { type TokenBuffer, tokenizeRomanLyric } from "./tokenizer";

class RomanDistributor {
	private words: LyricWord[];
	private buffer: TokenBuffer;
	private results: string[];

	// 待处理单词缓冲区
	// 存放尚未分配音译的“未知词”（汉字、促音、未匹配的假名等）
	// 找到下一个锚点时，将积累的 Token 分配给这些词
	private pendingWords: { index: number; word: LyricWord }[] = [];

	constructor(words: LyricWord[], romanLyric: string) {
		this.words = words;
		this.buffer = tokenizeRomanLyric(romanLyric);
		this.results = new Array(words.length).fill("");
	}

	public predict(): string[] {
		if (this.buffer.remaining === 0) {
			return this.getFallbackResults();
		}

		for (let i = 0; i < this.words.length; i++) {
			const word = this.words[i];

			if (this.shouldSkipWord(word, i)) {
				continue;
			}

			// 如果当前词是标点，且 Token 也是标点，直接消耗，否则视为不匹配
			// 可能是用户没输标点，或标点粘连在前一个词上，填空字符串
			if (this.tryConsumePunctuation(word, i)) {
				continue;
			}

			// 尝试将当前单词作为一个锚点来锁定 Token 流的位置
			if (this.tryMatchAnchor(word, i)) {
				continue;
			}

			// 无法确定当前词的读音，先放入缓冲区，等待遇到下一个锚点或行尾时统一分配
			this.pendingWords.push({ index: i, word });
		}

		// 将剩下的所有 Token 分配给剩下的所有单词
		this.flushPendingBuffer(this.buffer.consume(this.buffer.remaining));

		return this.results;
	}

	private getFallbackResults(): string[] {
		return this.words.map((w) => {
			if (shouldApplyDictionaryFallback(w.word)) {
				return getDictionaryRomaji(w.word);
			}
			return "";
		});
	}

	private shouldSkipWord(word: LyricWord, index: number): boolean {
		const text = word.word.trim();
		if (!text) {
			this.results[index] = "";
			return true;
		}
		return false;
	}

	private tryConsumePunctuation(word: LyricWord, index: number): boolean {
		if (isPunctuationOnly(word.word)) {
			const currentToken = this.buffer.peek(0);
			if (currentToken && isPunctuationOnly(currentToken)) {
				this.results[index] = this.buffer.consume(1)[0];
			} else {
				this.results[index] = "";
			}
			return true;
		}
		return false;
	}

	private tryMatchAnchor(word: LyricWord, index: number): boolean {
		const text = word.word.trim();

		// 决定什么样的词适合做锚点
		// 1. 必须是纯假名
		// 2. 不能是促音 (っ) - 促音通常附着在后续辅音上，不稳定
		// 3. 不能是长音 (ー) - 长音读音取决于前一个元音，不确定性高
		if (!isKanaOnly(text) || isSokuon(text) || isChoonpu(text)) {
			return false;
		}

		const expectedCandidates = getExpectedRomaji(text);
		// 防止跨度太大导致错误匹配
		const searchLimit = Math.min(this.buffer.remaining, 15);

		for (let offset = 0; offset < searchLimit; offset++) {
			const token = this.buffer.peek(offset);
			if (!token) continue;

			// Token 是否长得像锚点
			const matchResult = evaluateMatch(token, expectedCandidates);
			if (!matchResult) continue;

			// 如果锚点前面的空闲 Token 数量 < Buffer 里所有单词所需的总权重，说明这个匹配找早了
			// 例，Buffer="空白"(权重3)，Token流="ku, u, ha, ku..."
			// 如果匹配到 "ha"，前面只有 2 个 Token，不够分给 "空白"，因此跳过 "ha"，继续找后面的 "wa"
			// 注意这个逻辑非常依赖用户手动设置的空拍，如果没有空拍那么我们就无法判断汉字的权重了
			const availableTokens = offset + (matchResult.type === "Suffix" ? 1 : 0);
			const requiredTokens = this.getPendingBufferWeight();

			if (availableTokens < requiredTokens) {
				continue;
			}

			// 防止误匹配，如果当前对上了，检查下一个词是否也能对上
			if (!this.checkLookahead(index, matchResult.type, offset)) {
				continue;
			}

			this.applyAnchorMatch(index, offset, matchResult, token);
			return true;
		}

		return false;
	}

	/**
	 * 前瞻校验，防止误匹配
	 */
	private checkLookahead(
		currentIndex: number,
		matchType: MatchResult["type"],
		offset: number,
	): boolean {
		// 如果是前缀匹配（如 "suki" -> "su"），逻辑上的 Next Token 还在当前物理 Token 里
		// 这里的 Lookahead 比较复杂，简化处理直接通过
		if (matchType === "Prefix") return true;

		if (currentIndex + 1 >= this.words.length) return true;

		const nextWord = this.words[currentIndex + 1];
		const nextWordText = nextWord.word.trim();

		// 可靠锚点
		if (
			isKanaOnly(nextWordText) &&
			!isSokuon(nextWordText) &&
			!isPunctuationOnly(nextWordText) &&
			!isChoonpu(nextWordText)
		) {
			const nextExpected = getExpectedRomaji(nextWordText);
			const nextToken = this.buffer.peek(offset + 1);

			if (nextToken) {
				// 如果下一个 Token 完全不匹配下一个锚点，说明当前的匹配可能是错位了
				if (!evaluateMatch(nextToken, nextExpected)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * 分配前面的 Token，并设置当前锚点
	 */
	private applyAnchorMatch(
		index: number,
		offset: number,
		matchResult: MatchResult,
		originalToken: string,
	): void {
		// 消费掉锚点之前的所有 Token，交给 PendingBuffer 分配
		const bufferTokens = this.buffer.consume(offset);

		if (matchResult.type === "Suffix") {
			// 后缀匹配
			// 例，Token="tte", Expected="te" -> Buffer拿走"t", Anchor拿走"te"
			// 将 Token 切开，前半部分归 Buffer，后半部分归 Anchor
			const splitIndex = originalToken.lastIndexOf(matchResult.expected);
			const prefixPart = originalToken.slice(0, splitIndex);

			bufferTokens.push(prefixPart);
			this.flushPendingBuffer(bufferTokens);

			this.results[index] = matchResult.expected;
			// 消费掉这个被拆分的 Token
			this.buffer.consume(1);
		} else {
			// 精确匹配 或 前缀匹配
			this.flushPendingBuffer(bufferTokens);

			if (matchResult.type === "Exact") {
				// 精确匹配，直接消耗
				this.results[index] = this.buffer.consume(1)[0];
			} else {
				// 前缀匹配
				// 例，Token="suki", Expected="su" -> Anchor拿走"su", 剩下的 "ki" 留给后面
				this.results[index] = matchResult.expected;
				const remainder = originalToken.slice(matchResult.expected.length);
				// 原地修改 Token 数组，将剩下的部分放回原位
				this.buffer.replaceCurrent(remainder);
			}
		}
	}

	/**
	 * 计算 PendingBuffer 中所有单词所需的总权重 (Token数需求)
	 *
	 * 默认每个单词权重为 1，如果用户设置了 emptyBeat，则权重增加
	 */
	private getPendingBufferWeight(): number {
		return this.pendingWords.reduce((sum, item) => {
			const extra = item.word.emptyBeat || 0;
			return sum + 1 + extra;
		}, 0);
	}

	/**
	 * 将收集到的 tokens 分配给 pendingWords
	 */
	private flushPendingBuffer(tokens: string[]): void {
		if (this.pendingWords.length === 0) return;

		const wordCount = this.pendingWords.length;
		const tokenCount = tokens.length;

		if (tokenCount === 0) {
			this.pendingWords.forEach((item) => {
				this.results[item.index] = "";
			});
			this.pendingWords = [];
			return;
		}

		const weights = this.pendingWords.map((item) => {
			const extra = item.word.emptyBeat || 0;
			return 1 + extra;
		});

		const totalWeight = weights.reduce((a, b) => a + b, 0);

		let currentTokenIndex = 0;
		let accumulatedWeight = 0;

		for (let i = 0; i < wordCount; i++) {
			const weight = weights[i];
			accumulatedWeight += weight;

			// 基于权重比例分配 Token
			// (当前累计权重 / 总权重) * 总Token数
			const targetEndIndex =
				totalWeight > 0
					? Math.round((accumulatedWeight / totalWeight) * tokenCount)
					: Math.round(((i + 1) / wordCount) * tokenCount); // 兜底：平分

			const safeEndIndex = Math.min(targetEndIndex, tokenCount);
			const takeCount = safeEndIndex - currentTokenIndex;

			if (takeCount > 0) {
				const chunk = tokens.slice(
					currentTokenIndex,
					currentTokenIndex + takeCount,
				);
				this.results[this.pendingWords[i].index] = chunk.join(" ");
				currentTokenIndex += takeCount;
			} else {
				this.results[this.pendingWords[i].index] = "";
			}
		}

		this.pendingWords = [];
	}
}

/**
 * 获取单词预期的罗马音列表，用于处理日语助词的多音字
 *
 * wanakana 会将 "は" 转为 "ha"，但歌词中常写作 "wa"，
 * 我们需要允许锚点匹配任意一种可能的读音
 */
function getExpectedRomaji(text: string): string[] {
	const standard = getDictionaryRomaji(text);
	const results = new Set([standard]);

	if (text === "は") results.add("wa");
	if (text === "へ") results.add("e");
	if (text === "を") results.add("o");

	return Array.from(results);
}

/**
 * 匹配检查结果接口
 */
interface MatchResult {
	/**
	 * 匹配到的类型
	 */
	type: "Exact" | "Prefix" | "Suffix";
	/**
	 * 实际匹配到的预期值 ，例如匹配到了 "wa" 而不是 "ha"
	 */
	expected: string;
}

/**
 * 检查 Token 是否匹配候选列表
 */
function evaluateMatch(
	token: string,
	expectedCandidates: string[],
): MatchResult | null {
	const lowerToken = token.toLowerCase();

	for (const expected of expectedCandidates) {
		if (lowerToken === expected) return { type: "Exact", expected };

		if (lowerToken.startsWith(expected) && lowerToken.length > expected.length)
			return { type: "Prefix", expected };

		// 后缀匹配
		// 用于处理促音连写，如 Token="tte" 匹配锚点 "te"。
		if (lowerToken.endsWith(expected) && lowerToken.length > expected.length) {
			const prefix = lowerToken.slice(0, lowerToken.length - expected.length);
			const firstCharOfExpected = expected[0];
			const lastCharOfPrefix = prefix[prefix.length - 1];

			// 只有当切分点是合法的才允许后缀匹配
			// 如果锚点以元音开头 (如 "i")，前缀不能以非 n 的辅音结尾 (如 "g")
			// 阻止 "gi" -> "g"(Buffer) + "i"(Anchor) 的错误拆分
			if (ROMAJI_VOWELS.has(firstCharOfExpected)) {
				const isPrefixConsonant =
					!ROMAJI_VOWELS.has(lastCharOfPrefix) && lastCharOfPrefix !== "n";

				if (isPrefixConsonant) {
					continue;
				}
			}
			return { type: "Suffix", expected };
		}
	}
	return null;
}

/**
 * 基于锚点对齐的整行预测算法
 * @param words 当前行的单词列表
 * @param romanLyric 整行音译字符串
 */
export function predictLineRomanization(
	words: LyricWord[],
	romanLyric: string,
): string[] {
	const distributor = new RomanDistributor(words, romanLyric);
	return distributor.predict();
}
