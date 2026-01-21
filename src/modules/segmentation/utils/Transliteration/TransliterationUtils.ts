import * as wanakana from "wanakana";
import { ALL_PUNCTUATION } from "../charUtils";

/**
 * 罗马音元音
 */
export const ROMAJI_VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * 促音字符
 */
export const SOKUON_CHARS = new Set(["っ", "ッ"]);

/**
 * 一个字符是否是标点符号
 */
export function isPunctuationChar(char: string): boolean {
	return ALL_PUNCTUATION.has(char);
}

/**
 * 一个字符串是否完全由标点符号组成
 */
export function isPunctuationOnly(text: string): boolean {
	if (!text) return false;
	for (const char of text) {
		if (!isPunctuationChar(char)) {
			return false;
		}
	}
	return true;
}

/**
 * 判断字符是否是促音
 *
 * 在分配逻辑中，促音需要消耗罗马音的一个首字母 (如 "tto" -> "っ")
 */
export function isSokuon(char: string): boolean {
	return SOKUON_CHARS.has(char);
}

/**
 * 判断是否应该使用 Wanakana 进行转写
 *
 * 只有当文本包含假名时才尝试，全是汉字或英文则跳过
 */
export function shouldApplyDictionaryFallback(text: string): boolean {
	if (!text) return false;
	const cleanText = text.replace(/[、，。！？\s]/g, "");
	return wanakana.isJapanese(cleanText);
}

/**
 * 用字典获取罗马音
 */
export function getDictionaryRomaji(text: string): string {
	return wanakana.toRomaji(text, { upcaseKatakana: false });
}

/**
 * 判断是否是长音符号
 */
export function isChoonpu(char: string): boolean {
	return char === "ー";
}

/**
 * 判断字符串是否只包含日文假名（平假名/片假名）
 *
 * 用作锚点识别，假名的读音通常是固定的，适合作为对齐点
 */
export function isKanaOnly(text: string): boolean {
	if (!text) return false;
	const cleanText = text.replace(/[、，。！？\s]/g, "");
	return wanakana.isKana(cleanText);
}
