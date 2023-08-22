import { createI18n } from "vue-i18n";
import type { DefineLocaleMessage } from "vue-i18n";
import { zhCN } from "./zh-cn";
import { enUS } from "./en-us";

type BaseSchema = typeof zhCN;

declare module "vue-i18n" {
	// rome-ignore lint/suspicious/noRedeclare: <explanation>
	// rome-ignore lint/suspicious/noEmptyInterface: <explanation>
	export interface DefineLocaleMessage extends BaseSchema {}
}

type FullPartial<T> = { [K in keyof T]?: FullPartial<T[K]> | undefined };

export type LocateMessage = FullPartial<BaseSchema>;

export const i18n = createI18n<[typeof zhCN]>({
	legacy: false,
	globalInjection: true,
	locale: navigator.language,
	fallbackLocale: [...navigator.languages, "zh-CN"],
	messages: {
		// To add new language, please add your locale code (ISO 639-1 codes)
		// under the object and create a file that match the locate code
		// as name with .ts extension.
		// You can refer ./zh-cn.ts as a locale messages file example.
		"zh-CN": zhCN,
		"en-US": enUS,
	},
});
