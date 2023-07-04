mod lrc;
mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[derive(Debug, Clone, PartialEq)]
pub struct LyricWord<'a> {
    pub start_time: usize,
    pub end_time: usize,
    pub word: &'a str,
}

#[derive(Debug, Clone, PartialEq)]
pub struct LyricLine<'a> {
    pub words: Vec<LyricWord<'a>>,
}

#[wasm_bindgen(typescript_custom_section)]
const TS_TYPES: &'static str = r###"

/**
 * 解析 LyRiC 格式的歌词字符串
 * @param src 歌词字符串
 * @returns 成功解析出来的歌词
 */
export function parseLrc(src: string): LyricLine[];

/**
 * 一个歌词单词
 */
export class LyricWord {
    free(): void;
    /** 单词的起始时间 */
    startTime: number;
    /** 单词的结束时间 */
    endTime: number;
    /** 单词 */
    word: string;
};

/**
 * 一行歌词，存储多个单词
 * 如果是 LyRiC 等只能表达一行歌词的格式，则会将整行当做一个单词存储起来
 */
export class LyricLine {
    free(): void;
    /**
     * 该行的所有单词
     * 如果是 LyRiC 等只能表达一行歌词的格式，这里就只会有一个单词
     */
    words: LyricWord[];
};

"###;

#[derive(Debug, Clone, PartialEq)]
#[wasm_bindgen(getter_with_clone, js_name = "LyricWord", skip_typescript)]
pub struct JSLyricWord {
    #[wasm_bindgen(js_name = "startTime")]
    pub start_time: usize,
    #[wasm_bindgen(js_name = "endTime")]
    pub end_time: usize,
    pub word: String,
}

#[derive(Debug, Clone)]
#[wasm_bindgen(getter_with_clone, js_name = "LyricLine", skip_typescript)]
pub struct JSLyricLine {
    pub words: js_sys::Array,
}

impl From<LyricLine<'_>> for JSLyricLine {
    fn from(l: LyricLine) -> Self {
        JSLyricLine {
            words: l
                .words
                .into_iter()
                .map(JSLyricWord::from)
                .map(JsValue::from)
                .collect(),
        }
    }
}

impl From<LyricWord<'_>> for JSLyricWord {
    fn from(l: LyricWord) -> Self {
        JSLyricWord {
            start_time: l.start_time,
            end_time: l.end_time,
            word: l.word.to_owned(),
        }
    }
}
