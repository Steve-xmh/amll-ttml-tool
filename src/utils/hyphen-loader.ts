import type { HyphenatorFunc } from "./segmentation-types";

export const SUPPORTED_LANGUAGES = [
	{ label: "English (US)", value: "en-us" },
	{ label: "Deutsch (German)", value: "de" },
	{ label: "Français (French)", value: "fr" },
	{ label: "Español (Spanish)", value: "es" },
	{ label: "Italiano (Italian)", value: "it" },
	{ label: "Português (Portuguese)", value: "pt" },
	{ label: "Pусский (Russian)", value: "ru" },
];

const hyphenatorCache: Record<string, HyphenatorFunc> = {};

export async function loadHyphenator(
	lang: string,
): Promise<HyphenatorFunc | null> {
	if (hyphenatorCache[lang]) {
		return hyphenatorCache[lang];
	}

	try {
		let module: { hyphenateSync: HyphenatorFunc };
		switch (lang) {
			case "en-us":
				module = await import("hyphen/en-us");
				break;
			case "de":
				module = await import("hyphen/de");
				break;
			case "fr":
				module = await import("hyphen/fr");
				break;
			case "es":
				module = await import("hyphen/es");
				break;
			case "it":
				module = await import("hyphen/it");
				break;
			case "pt":
				module = await import("hyphen/pt");
				break;
			case "ru":
				module = await import("hyphen/ru");
				break;
			default:
				throw new Error(`不支持的语言: ${lang}`);
		}

		const func = module.hyphenateSync;
		if (typeof func === "function") {
			hyphenatorCache[lang] = func;
			return func;
		}
		return null;
	} catch (error) {
		console.error(`为 ${lang} 加载分词引擎失败:`, error);
		return null;
	}
}
