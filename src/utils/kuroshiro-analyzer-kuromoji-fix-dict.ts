import kuromoji from "kuromoji/build/kuromoji";
import Kuroshiro from "kuroshiro/dist/kuroshiro";

export interface ParseResult {
	surface_form: string;
	pos: string;
	pos_detail_1: string;
	pos_detail_2: string;
	pos_detail_3: string;
	conjugated_type: string;
	conjugated_form: string;
	basic_form: string;
	reading: string;
	pronunciation: string;
	verbose: {
		word_id: number;
		word_type: string;
		word_position: number;
	};
}

/**
 * Kuromoji based morphological analyzer for kuroshiro
 */
export class Analyzer {
	private _analyzer: any;
	/**
	 * Constructor
	 * @param {Object} [options] JSON object which have key-value pairs settings
	 * @param {string} [options.dictPath] Path of the dictionary files
	 */
	constructor(private _dictPath: string) {
		this._analyzer = null;
	}

	/**
	 * Initialize the analyzer
	 * @returns {Promise} Promise object represents the result of initialization
	 */
	init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const self = this;
			if (this._analyzer == null) {
				kuromoji
					.builder({ dicPath: this._dictPath })
					.build((err, newAnalyzer) => {
						if (err) {
							return reject(err);
						}
						self._analyzer = newAnalyzer;
						resolve();
					});
			} else {
				reject(new Error("This analyzer has already been initialized."));
			}
		});
	}

	/**
	 * Parse the given string
	 * @param str input string
	 * @returns Promise object represents the result of parsing
	 * @example The result of parsing
	 * [{
	 *     "surface_form": "黒白",    // 表層形
	 *     "pos": "名詞",               // 品詞 (part of speech)
	 *     "pos_detail_1": "一般",      // 品詞細分類1
	 *     "pos_detail_2": "*",        // 品詞細分類2
	 *     "pos_detail_3": "*",        // 品詞細分類3
	 *     "conjugated_type": "*",     // 活用型
	 *     "conjugated_form": "*",     // 活用形
	 *     "basic_form": "黒白",      // 基本形
	 *     "reading": "クロシロ",       // 読み
	 *     "pronunciation": "クロシロ",  // 発音
	 *     "verbose": {                 // Other properties
	 *         "word_id": 413560,
	 *         "word_type": "KNOWN",
	 *         "word_position": 1
	 *     }
	 * }]
	 */
	parse(str = ""): Promise<ParseResult[]> {
		return new Promise((resolve) => {
			if (str.trim() === "") return resolve([]);
			const result = this._analyzer!!.tokenize(str);
			for (const w of result) {
				w.verbose = {
					word_id: w.word_id,
					word_type: w.word_type,
					word_position: w.word_position,
				};
				// rome-ignore lint/performance/noDelete: <explanation>
				delete w.word_id;
				// rome-ignore lint/performance/noDelete: <explanation>
				delete w.word_type;
				// rome-ignore lint/performance/noDelete: <explanation>
				delete w.word_position;
			}
			resolve(result);
		});
	}
}

export const kuroshiro = new Kuroshiro();
await kuroshiro.init(new Analyzer("kuromoji-dict"));
