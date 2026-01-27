import * as wanakana from "wanakana";
import type { LyricWord } from "$/types/ttml";
import {
	getDictionaryRomaji,
	isPunctuationChar,
	isPunctuationOnly,
} from "./TransliterationUtils";

const PARTICLE_ALTERNATIVES = new Map([
	["は", ["wa"]],
	["へ", ["e"]],
	["を", ["o"]],
]);

const SMALL_KANA = new Set([
	"ぁ",
	"ぃ",
	"ぅ",
	"ぇ",
	"ぉ",
	"ゃ",
	"ゅ",
	"ょ",
	"っ",
	"ゎ",
	"ゕ",
	"ゖ",
	"ァ",
	"ィ",
	"ゥ",
	"ェ",
	"ォ",
	"ャ",
	"ュ",
	"ョ",
	"ッ",
	"ヮ",
	"ヵ",
	"ヶ",
]);

const normalizeWordForCheck = (text: string): string => {
	const trimmed = text.trim();
	if (!trimmed) return "";
	let normalized = "";
	for (const char of trimmed) {
		if (!isPunctuationChar(char)) {
			normalized += char;
		}
	}
	return normalized || trimmed;
};

const shouldCheckWord = (text: string): boolean => {
	if (!text) return false;
	if (Array.from(text).length !== 1) return false;
	if (SMALL_KANA.has(text)) return false;
	if (isPunctuationOnly(text)) return false;
	if (/^\d+$/.test(text)) return false;
	if (!wanakana.isJapanese(text)) return false;
	if (wanakana.isKanji(text)) return false;
	return true;
};

const getExpectedRomajiCandidates = (text: string): string[] => {
	const base = getDictionaryRomaji(text).toLowerCase();
	const candidates = new Set([base]);
	const extra = PARTICLE_ALTERNATIVES.get(text);
	if (extra) {
		for (const item of extra) {
			candidates.add(item);
		}
	}
	return Array.from(candidates);
};

export const applyRomanizationWarnings = (words: LyricWord[]): void => {
	for (const word of words) {
		const normalizedText = normalizeWordForCheck(word.word);
		if (!shouldCheckWord(normalizedText)) {
			word.romanWarning = false;
			continue;
		}

		const expected = getExpectedRomajiCandidates(normalizedText);
		const romanWord = (word.romanWord || "").replace(/\s+/g, "").toLowerCase();
		word.romanWarning = romanWord === "" || !expected.includes(romanWord);
	}
};
