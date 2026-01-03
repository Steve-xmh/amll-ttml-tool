import type { I18nKey } from "./types";

/**
 * 仅用于欺骗 i18next-parser 进行键值提取
 *
 * 运行时它只是原样返回字符串
 */
export const t = (key: I18nKey) => key;
