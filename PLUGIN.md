# AMLL TTML Tools 插件概述/开发指南（施工中）

由于日益增长的多样需求，考虑到尽量保持工具本身功能不会过于臃肿和繁杂，且尽量满足更多情况下的特殊需求，故着手规定一套用于 AMLL TTML Tools 的歌词工具插件接口规范，以尽可能满足各位歌词制作者的一些特殊需求。

## 概述

插件基于 Extism 插件框架实现，允许多种语言开发，编译至 WASM 供 AMLL TTML Tools 加载使用，具体可参考 [Extism 官网](https://extism.org/)。

预计允许实现以下功能：

- 可以对歌词所有数据进行访问，可以访问并修改歌词，创建编辑记录点（用于撤销重做）
- 可以监听各种用户操作歌词的事件（编辑单词、设置时间戳（打轴））
- 可以创建扩展下拉菜单项目，可以给使用者点击并获得回调
- 可以对用户弹出表单输入，以供更多定制性操作配置
- 可以弹出通知框，进度框供使用者了解当前操作情况

## 函数原型描述解释

根据 Extism 的架构，接口文档会以以下格式描述一个函数：

```
返回值 函数名(参数)
```

返回值和参数如无特例，均为 JSON 字符串，并会在后文留下 JSON 对象的数据结构。

### 数据类型

- `i8`, `i16`, `i32`, `i64`， `u8`, `u16`, `u32`, `u64` - 常见整数数字类型
- `String` - 一个字符串指针，以 NULL 空零值结尾
- `LyricLine` 等非以上名称的类型 - 以 JSON 字符串存储的数据结构类型
- `LyricLine[]` 等非以上名称的**带中括号**类型 - 以 JSON 字符串存储的**数组**数据结构类型

## 插件函数定义

### 插件生命周期函数

以下函数均需要定义，

| 函数原型                      | 必需   | 描述                                                       |
| ----------------------------- | ------ | ---------------------------------------------------------- |
| `void plugin_on_load(void)`   | `true` | 当插件被加载时调用，这是插件生命周期中第一个被调用的函数   |
| `void plugin_on_unload(void)` | `true` | 当插件被卸载时调用，这是插件生命周期中最后一个被调用的函数 |

### 插件相关事件函数

以下函数均为可选定义，AMLL TTML Tools 将会以是否注册函数定义来自动针对事件触发调用函数。

| 函数原型                                       | 必需    | 描述                                                                          |
| ---------------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `void event_on_lyric_update(LyricUpdateEvent)` | `false` | 当用户操作歌词任意数据时触发，不包含来自插件对歌词的修改                      |
| `void event_on_undo(void)`                     | `false` | 当用户执行撤销操作时触发                                                      |
| `void event_on_redo(void)`                     | `false` | 当用户执行重做操作时触发                                                      |
| `void event_on_click_plugin_menu_item(String)` | `false` | 当用户点击了插件菜单中的菜单项时触发，参数为注册菜单项目时定义的字符串菜单 ID |

## 宿主函数定义

以下宿主函数均可按实际需求在任意的插件函数定义中调用，以实现任意需要的扩展功能。

### 歌词编辑相关

| 函数原型                      | 描述                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| `LyricLine[] lyric_get(void)` | 获取当前歌词全文的数据，返回 JSON 字符串，代表一个 `LyricLine[]` 结构       |
| `void lyric_set(LyricLine[])` | 设置当前正在编辑的歌词数据，参数为 JSON 字符串，代表一个 `LyricLine[]` 结构 |
| `void lyric_record(void)`     | 记录当前歌词编辑状态快照，以便用户撤消重做操作                              |

### 扩展菜单相关

| 函数原型          | 描述         |
| ----------------- | ------------ |
| `void menu_new()` | 创建一个菜单 |

## 数据结构

### `LyricUpdateEvent`

| 字段名      | 字段类型 | 描述                       |
| ----------- | -------- | -------------------------- |
| `lineIndex` | `u64`    | 用户所更新的歌词行索引位置 |
| `wordIndex` | `u64`    | 用户所更新的单词索引位置   |

### `LyricLine`

| 字段名            | 字段类型      | 描述                                     |
| ----------------- | ------------- | ---------------------------------------- |
| `words`           | `LyricWord[]` | 该行的所有单词                           |
| `translatedLyric` | `String`      | 该行的翻译歌词                           |
| `romanLyric`      | `String`      | 该行的音译歌词                           |
| `isBG`            | `boolean`     | 该行是否为背景歌词行                     |
| `isDuet`          | `boolean`     | 该行是否为对唱歌词行（即歌词行靠右对齐） |
| `startTime`       | `u64`         | 句子的起始时间，单位为毫秒               |
| `endTime`         | `u64`         | 句子的结束时间，单位为毫秒               |

### `LyricWord`

| 字段名      | 字段类型 | 描述                       |
| ----------- | -------- | -------------------------- |
| `word`      | `String` | 单词的文字内容             |
| `startTime` | `u64`    | 单词的起始时间，单位为毫秒 |
| `endTime`   | `u64`    | 单词的结束时间，单位为毫秒 |
| `emptyBeat` | `u64`    | 单词的空拍数量             |
