/**
 * @description 用于分词引擎的类型
 */

/**
 * @description 字符类型，用于分词和权重计算
 */
export enum CharType {
	Cjk,
	Latin,
	Numeric,
	Whitespace,
	Other,
}

export type HyphenatorFunc = (text: string) => string;

/**
 * @description 高级分词的配置选项
 */
export interface SegmentationConfig {
	/**
	 * 是否对 CJK 字符按字符分词
	 *
	 * @default true
	 */
	splitCJK: boolean;
	/**
	 * 是否对英文单词按音节分词
	 *
	 * @default true
	 */
	splitEnglish: boolean;
	/**
	 * 标点符号在分配时长时占的权重（相对于一个字符）
	 *
	 * @default 0.2
	 */
	punctuationWeight: number;
	/**
	 * 标点符号处理方式
	 *
	 * @default "merge"
	 */
	punctuationMode: "merge" | "standalone";
	/**
	 * 是否移除空白音节
	 *
	 * @default true
	 */
	removeEmptySegments: boolean;
	/**
	 * 忽略列表
	 */
	ignoreList: Set<string>;
	/**
	 * 自定义分词规则
	 */
	customRules: Map<string, string[]>;
	/**
	 * 当前使用的连字符分词函数
	 * 如果未提供，则不执行西文音节的自动分词
	 */
	hyphenator?: HyphenatorFunc;
}
