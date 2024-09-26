/*
 * Copyright 2023-2024 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { createI18n, type I18nOptions } from "vue-i18n";
import { enUS } from "./en-us";
import { zhCN } from "./zh-cn";

type BaseSchema = typeof zhCN;

declare module "vue-i18n" {
	export interface DefineLocaleMessage extends BaseSchema {}
}

type FullPartial<T> = { [K in keyof T]?: FullPartial<T[K]> | undefined };

export type LocateMessage = FullPartial<BaseSchema>;

const options: I18nOptions = {
	legacy: false,
	globalInjection: true,
	silentFallbackWarn: true,
	locale: navigator.language,
	fallbackLocale: [...navigator.languages, "zh-CN"],
	messages: {
		// To add new language, please add your locale code (ISO 639-1 codes)
		// under the object and create a file that match the locate code
		// as name with .ts extension.
		// You can refer ./zh-cn.ts as a locale messages file example.
		"zh-CN": zhCN,
		"en-US": enUS as BaseSchema,
	},
};

export const i18n = createI18n<false, typeof options>(options);
