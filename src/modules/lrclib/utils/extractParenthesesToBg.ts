import { uid } from "uid";
import { type LyricLine, newLyricWord } from "$/types/ttml";

const capitalizeFirstLetter = (str: string) => {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * 将一行歌词中的括号内容提取到新的背景人声行中
 *
 * 例如，输入 123 (abc) 456 将会输出
 * - 123 456
 * - abc (背景人声)
 *
 * 多个括号中的内容会原样拼接到新的行中，例如 123 (abc) 789 (def) 将会输出
 * - 123 789
 * - abc def (背景人声)
 *
 * 如果传入的歌词行全部被括号包裹，会直接变成背景人声
 *
 * 注意目前只适用于逐行歌词，不要传逐字歌词
 * @param line 原始的歌词行
 * @returns 提取背景人声后的歌词行数组，第二行应为背景人声
 */
export function extractParenthesesToBg(line: LyricLine): LyricLine[] {
	const fullText = line.words.map((w) => w.word).join("");
	const regex = /([(（])(.*?)([)）])/g;
	const matches = Array.from(fullText.matchAll(regex));

	if (matches.length === 0) {
		return [line];
	}

	const rawMainText = fullText.replace(regex, "").replace(/\s+/g, " ").trim();
	const mainText = capitalizeFirstLetter(rawMainText);

	const rawBgText = matches.map((m) => m[2].trim()).join(" ");
	const bgText = capitalizeFirstLetter(rawBgText);

	if (!mainText) {
		return [
			{ ...line, isBG: true, words: [{ ...line.words[0], word: bgText }] },
		];
	}

	const totalDuration = line.endTime - line.startTime;
	const mainLen = mainText.length;
	const bgLen = bgText.length;
	const totalLen = mainLen + bgLen;

	if (totalLen === 0) return [line];

	const mainDuration = Math.floor(totalDuration * (mainLen / totalLen));

	const mainLine: LyricLine = {
		...line,
		words: [
			{
				...newLyricWord(),
				word: mainText,
				startTime: line.startTime,
				endTime: line.startTime + mainDuration,
			},
		],
		endTime: line.startTime + mainDuration,
	};

	const bgLine: LyricLine = {
		...line,
		id: uid(),
		isBG: true,
		words: [
			{
				...newLyricWord(),
				word: bgText,
				startTime: line.startTime + mainDuration,
				endTime: line.endTime,
			},
		],
		startTime: line.startTime + mainDuration,
	};

	return [mainLine, bgLine];
}
