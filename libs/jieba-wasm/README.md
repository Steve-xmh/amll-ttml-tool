# jieba-wasm

> [jieba-rs](https://github.com/messense/jieba-rs) 的 wasm binding

_编译成 WASM 摆脱编译 Node Addon 的烦恼_

# Usage

```js
const {
  cut,
  cut_all,
  cut_for_search,
  tokenize,
  add_word,
} = require("jieba-wasm");
cut("中华人民共和国武汉市长江大桥", true);
// [ '中华人民共和国', '武汉市', '长江大桥' ]
cut_all("中华人民共和国武汉市长江大桥", true);
/*
[
  '中',         '中华',
  '中华人民',   '中华人民共和国',
  '华',         '华人',
  '人',         '人民',
  '人民共和国', '民',
  '共',         '共和',
  '共和国',     '和',
  '国',         '武',
  '武汉',       '武汉市',
  '汉',         '市',
  '市长',       '长',
  '长江',       '长江大桥',
  '江',         '大',
  '大桥',       '桥'
]
*/
cut_for_search("中华人民共和国武汉市长江大桥", true);
/*
[
  '中华',     '华人',
  '人民',     '共和',
  '共和国',   '中华人民共和国',
  '武汉',     '武汉市',
  '长江',     '大桥',
  '长江大桥'
]
*/
tokenize("中华人民共和国武汉市长江大桥", "default", true);
/*
[
  { word: '中华人民共和国', start: 0, end: 7 },
  { word: '武汉市', start: 7, end: 10 },
  { word: '长江大桥', start: 10, end: 14 }
]
*/
tokenize("中华人民共和国武汉市长江大桥", "search", true);
/*
[
  { word: '中华', start: 0, end: 2 },
  { word: '华人', start: 1, end: 3 },
  { word: '人民', start: 2, end: 4 },
  { word: '共和', start: 4, end: 6 },
  { word: '共和国', start: 4, end: 7 },
  { word: '中华人民共和国', start: 0, end: 7 },
  { word: '武汉', start: 7, end: 9 },
  { word: '武汉市', start: 7, end: 10 },
  { word: '长江', start: 10, end: 12 },
  { word: '大桥', start: 12, end: 14 },
  { word: '长江大桥', start: 10, end: 14 }
]
*/

cut("桥大江长市汉武的省北湖国和共民人华中");
/*
[
  '桥', '大江', '长',
  '市', '汉',   '武',
  '的', '省',   '北湖',
  '国', '和',   '共',
  '民', '人',   '华中'
]
*/
["桥大江长", "市汉武", "省北湖", "国和共民人华中"].map((word) => {
  add_word(word);
});
cut("桥大江长市汉武的省北湖国和共民人华中");
// ["桥大江长", "市汉武", "的", "省北湖", "国和共民人华中"];
```

# Piror Art

https://github.com/messense/jieba-rs
