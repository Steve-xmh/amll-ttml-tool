/**
 * @fileoverview 罗马音分词引擎
 * 负责将罗马音字符串切分为可消费的 Token 队列
 */

import { ROMAJI_VOWELS } from "./TransliterationUtils";

export class TokenBuffer {
	private tokens: string[];
	private cursor: number = 0;

	constructor(tokens: string[]) {
		this.tokens = tokens;
	}

	/**
	 * 还有多少 Token 未处理
	 */
	get remaining(): number {
		return Math.max(0, this.tokens.length - this.cursor);
	}

	/**
	 * 向前 peek Token，不移动游标
	 */
	peek(offset: number = 0): string | undefined {
		return this.tokens[this.cursor + offset];
	}

	/**
	 * 消费指定数量的 Token，并移动游标
	 * @returns 被消费的 Token 列表
	 */
	consume(count: number): string[] {
		if (count <= 0) return [];
		const chunk = this.tokens.slice(this.cursor, this.cursor + count);
		this.cursor += count;
		return chunk;
	}

	/**
	 * 原地修改当前游标指向的 Token
	 *
	 * 用于 Prefix 拆分场景: consumes "su", leaves "ki"
	 */
	replaceCurrent(newValue: string): void {
		if (this.cursor < this.tokens.length) {
			this.tokens[this.cursor] = newValue;
		}
	}
}

/**
 * 尝试拆分连写的罗马音
 *
 * 一个典型的使用场景是用户输入 "bokura"，但 LyricWord 是 ["ぼ", "く", "ら"]
 *
 * 逻辑: 简单按 "辅音+元音" 模式尝试切分
 */
export function autoSplitRomajiChunk(token: string): string[] | null {
	const stripped = token.trim();
	// 如果包含非字母，不进行拆分，防止误伤
	if (!/^[a-zA-Z]+$/.test(stripped)) {
		return null;
	}

	// 统计元音数量
	let vowelCount = 0;
	const lower = stripped.toLowerCase();
	for (const char of lower) {
		if (ROMAJI_VOWELS.has(char)) vowelCount++;
	}

	// 只要有元音我们就尝试处理，即使是单音节单词 (ka, sshi)，
	// 也进入流程，靠最后的 length <= 1 拦截不需要拆分的词
	if (vowelCount < 1) return null;

	const segments: string[] = [];
	let idx = 0;
	const len = stripped.length;

	while (idx < len) {
		const start = idx;
		const currentChar = lower[idx];
		const nextChar = idx + 1 < len ? lower[idx + 1] : "";

		// 促音/叠词处理，如 sshi -> s, shi;  matte -> ma, t, te
		const isConsonant = !ROMAJI_VOWELS.has(currentChar);
		if (isConsonant && currentChar === nextChar) {
			// 切分出第一个辅音作为独立 Token ，代表促音
			segments.push(stripped.slice(start, idx + 1));
			idx++;
			// 直接进入下一次循环，从第二个辅音开始处理
			continue;
		}

		// 特殊处理 'n' (拨音): 后面没有元音，或者后面是辅音(非y)
		if (currentChar === "n") {
			const nextNext = idx + 2 < len ? lower[idx + 2] : "";

			// 判断是否是拨音 'n' 的结束条件
			const isNextVowel = ROMAJI_VOWELS.has(nextChar);
			const isNextYaYuYo = nextChar === "y" && ROMAJI_VOWELS.has(nextNext);

			if (!isNextVowel && !isNextYaYuYo) {
				segments.push(stripped.slice(start, idx + 1));
				idx++;
				continue;
			}
		}

		// 吞噬辅音，直到遇到元音
		while (idx < len && !ROMAJI_VOWELS.has(lower[idx])) {
			idx++;
		}

		// 还没结束，说明找到了元音，包含该元音
		if (idx < len) {
			idx++;
		}

		segments.push(stripped.slice(start, idx));
	}

	// 拆分失败或没有拆细 (例如 "ka" -> ["ka"])，返回 null 表示无需操作
	if (segments.length <= 1) return null;

	return segments;
}

/**
 * 主分词入口
 * @param text 罗马音整句
 * @param aggressiveSplit 是否启用连写拆分 (例如 "suki" -> "su", "ki")
 */
export function tokenizeRomanLyric(
	text: string,
	aggressiveSplit = true,
): TokenBuffer {
	if (!text) return new TokenBuffer([]);

	const rawTokens = text
		.trim()
		.split(/[\s\t]+/)
		.filter((t) => t);

	const refinedTokens: string[] = [];
	for (const raw of rawTokens) {
		// 用于处理 suki -> su, ki
		if (aggressiveSplit) {
			const splits = autoSplitRomajiChunk(raw);
			if (splits) {
				refinedTokens.push(...splits);
			} else {
				// 无法按罗马音拆分（比如 "da」"），保持原样
				refinedTokens.push(raw);
			}
		} else {
			refinedTokens.push(raw);
		}
	}

	return new TokenBuffer(refinedTokens);
}
