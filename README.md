> **WARNING**
> 本工具仍在开发当中，仍有很多缺失的功能和 BUG，请仅用作尝鲜用途，并随时保存你的歌词文件以防万一！

<div align=center>

![](./public/logo.svg)

# Apple Music-like Lyrics TTML Tool

一个全新的逐词歌词编辑器！针对 [Apple Music-like Lyrics 网易云插件](https://github.com/Steve-xmh/applemusic-like-lyrics)设计！

</div>

## 使用

你可以通过访问 [`https://steve-xmh.github.io/amll-ttml-tool/`](https://steve-xmh.github.io/amll-ttml-tool/)来使用本工具的在线版本。

也可以使用 Github Action 构建的 Tauri 桌面版本，具体见 [Github Action 构建 Tauri 桌面版本](https://github.com/Steve-xmh/amll-ttml-tool/actions/workflows/build-test.yaml)。

## 编辑器功能（计划中）

最新进度可以前往[这个议题查看](https://github.com/Steve-xmh/amll-ttml-tool/issues/2)

- 基本输入、编辑、打轴功能
- 读取保存 TTML 格式歌词
- 配置歌词行行为（背景歌词、对唱歌词等）
- 配置歌词文件元数据（名称，作者，网易云音乐ID等）
- 拆分/组合/移动单词
- LRC/ESLyric/YRC/QRC/Lyricify Syllable 等歌词文件格式的导入导出
- 支持带有特殊标识符的纯文本导入歌词
- Jieba 分词拆分句子
- 对日语下的汉字启用注音标注
- 生成网易云形式的日语音译歌词行
- 生成网易云格式的粤语音译歌词行
- 可配置的快捷键
- 从 Apple Music 中获取 Apple Syllable 逐词歌词（也是 TTML 歌词）

## 开发构建

本工具构建可能相对比较复杂，如果文字描述太过繁杂的话可以直接参考 [`build-web.yaml`](.github/workflows/build-web.yaml) 工作流的步骤自行进行。

首先，本项目仅可使用 Yarn 2，请确保你已经安装好了 Yarn 包管理器和 wasm-pack！

然后克隆本仓库和 [`Steve-xmh/applemusic-like-lyrics`](https://github.com/Steve-xmh/applemusic-like-lyrics) 仓库，克隆到同一文件夹下，即文件夹结构大致如下：

```
.
|- applemusic-like-lyrics
\- amll-ttml-tool
```

然后在 `applemusic-like-lyrics` 下执行构建：
```bash
cd packages/lyric # 构建歌词解析模块
wasm-pack build --release --scope applemusic-like-lyrics
cd ../ws-protocol # 构建 WebSocket 协议模块
wasm-pack build --release --scope applemusic-like-lyrics
cd ../fft # 构建音频可视化模块
wasm-pack build --release --scope applemusic-like-lyrics
yarn # 开始安装前端依赖
cd ../core # 构建歌词组件核心模块
yarn build
cd ../vue # 构建歌词组件 Vue 组件绑定
yarn build
cd ../ttml # 构建 TTML 歌词解析模块
yarn build
```

最后回到 `amll-ttml-tool` 下执行构建：

```bash
yarn # 安装依赖
yarn dev # 开启开发服务器
yarn build # 构建网页版本
yarn tauri dev # 开启 Tauri 桌面版本开发环境
yarn tauri build # 构建 Tauri 桌面版本
```

## 截图

<img width="912" alt="image" src="https://github.com/Steve-xmh/amll-ttml-tool/assets/39523898/e12220b5-0490-43da-bbbe-44ea2d64eef3">
<img width="912" alt="image" src="https://github.com/Steve-xmh/amll-ttml-tool/assets/39523898/53b74012-ed11-405c-8411-59bc2036abb9">

## 贡献

欢迎各种积极的代码/翻译贡献！也欢迎积极提交各种议题和建议！

如果想要提供新的语言翻译，可以参考 [`./src/i18n/index.ts`](./src/i18n/index.ts) 和 [`./src/i18n/zh-cn.ts`](./src/i18n/zh-cn.ts) 哦！
