import { createI18n } from "vue-i18n";
import { zhCN } from "./zh-cn";

type FullPartial<T> = { [K in keyof T]?: FullPartial<T[K]> | undefined };

export type LocateMessage = FullPartial<typeof zhCN>;

// To add new language, please add your locale code (ISO 639-1 codes)
// under the object and create a file that match the locate code
// as name with .ts extension.
// You can refer ./zh-cn.ts as a locale messages file example.
const messages: {
	[locateId: string]: LocateMessage;
} = {
	"zh-CN": zhCN,
};

export const i18n = createI18n({
	locale: navigator.language,
	fallbackLocale: [...navigator.languages, "zh-CN"],
	messages,
});
