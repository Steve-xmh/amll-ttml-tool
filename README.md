# Apple Music-like Lyrics TTML Tool

一个全新的逐词歌词编辑器！针对 [Apple Music-like Lyrics 网易云插件](https://github.com/Steve-xmh/applemusic-like-lyrics)设计！

## 编辑器功能（计划中）

最新进度可以前往[这个议题查看](https://github.com/Steve-xmh/amll-ttml-tool/issues/2)

- 基本输入、编辑、打轴功能
- 读取保存 TTML 格式歌词
- 配置歌词行行为（背景歌词、对唱歌词等）
- 配置歌词文件元数据（名称，作者，网易云音乐ID等）
- 拆分/组合/移动单词
- LRC/YRC/QRC/Lyricify Syllable 歌词文件的导入导出
- Jieba 分词拆分句子
- 对日语下的汉字启用注音标注
- 生成网易云形式的日语音译歌词行
- 生成网易云格式的粤语音译歌词行
- 可配置的快捷键
- 从 Apple Music 中获取 Apple Syllable 逐词歌词（也是 TTML 歌词）

## 开发构建

首先，本项目仅可使用 Yarn 2，请确保你已经安装好了 Yarn 包管理器后运行以下你需要使用的指令：

```bash
yarn # 安装依赖
yarn dev # 开启开发服务器
yarn build # 构建网页版本
yarn tauri dev # 开启 Tauri 桌面开发环境
yarn tauri build # 构建 Tauri 桌面版本
```

## 截图

<img width="912" alt="image" src="https://github.com/Steve-xmh/amll-ttml-tool/assets/39523898/e12220b5-0490-43da-bbbe-44ea2d64eef3">
<img width="912" alt="image" src="https://github.com/Steve-xmh/amll-ttml-tool/assets/39523898/53b74012-ed11-405c-8411-59bc2036abb9">
