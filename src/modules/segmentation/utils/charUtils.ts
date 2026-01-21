import { CharType } from "../types";

export const RE_WHITESPACE = /[\s\n\t]/;
export const RE_LATIN =
	/[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}\p{M}']/u;
export const RE_NUMERIC = /[0-9]/;

/**
 * 判断单个字符的类型
 */
export function getCharType(c: string): CharType {
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
 * 标点符号的结合方向
 */
export enum MergeDirection {
	Left,
	Right,
}

/**
 * 左标点：通常不与前面的词粘连
 */
export const PUNCT_LEFT = new Set([
	"(",
	"[",
	"{",
	"<",
	"「",
	"『",
	"（",
	"【",
	"《",
	"〈",
	"〔",
	"｢",
	"“",
	"‘",
	"«",
	"‹",
	"¿",
	"¡",
]);

/**
 * 右标点：通常不与后面的词粘连
 */
export const PUNCT_RIGHT = new Set([
	")",
	"]",
	"}",
	">",
	"」",
	"』",
	"）",
	"】",
	"》",
	"〉",
	"〕",
	"｣",
	"”",
	"’",
	"»",
	"›",
]);

/**
 * 容易引起歧义的引号 (分词时需特殊处理)
 */
export const PUNCT_AMBIGUOUS_QUOTES = new Set(['"']);

/**
 * 其他标点 (句号、逗号、连字符等)
 */
export const PUNCT_EXTRA = new Set([
	",",
	"，",
	"。",
	"．",
	".",
	"?",
	"!",
	"！",
	"？",
	"、",
	"；",
	";",
	":",
	"：",
	"'",
	"’",
	"〜",
	"～",
	"-",
	"—",
	"…",
	"⋯",
	"·",
	"♪",
]);

export const ALL_PUNCTUATION = new Set([
	...PUNCT_LEFT,
	...PUNCT_RIGHT,
	...PUNCT_AMBIGUOUS_QUOTES,
	...PUNCT_EXTRA,
]);

/**
 * 判断标点符号应该向哪个方向合并
 */
export function getMergeDirection(text: string): MergeDirection {
	const firstChar = text.trim().charAt(0);

	if (PUNCT_LEFT.has(firstChar)) {
		return MergeDirection.Right;
	}

	// 句号、逗号、右括号等其他所有标点向左合并
	return MergeDirection.Left;
}

/**
 * 转义正则特殊字符
 * 防止字符串里的特殊符号搞崩正则
 */
export function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
