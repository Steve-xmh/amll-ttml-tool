> **WARNING**
> 本工具仍在开发当中，仍有很多缺失的功能和 BUG，请仅用作尝鲜用途，并随时保存你的歌词文件以防万一！

<div align=center>

![](./public/logo.svg)

# Apple Music-like Lyrics TTML Tool

一个全新的逐词歌词编辑器！针对 [Apple Music-like Lyrics 生态](https://github.com/Steve-xmh/applemusic-like-lyrics)制作！

</div>

## 使用

> [!WARNING]
> 本工具不建议移动手机或小尺寸电子设备使用，操作会非常繁琐！

你可以通过访问 [`https://steve-xmh.github.io/amll-ttml-tool/`](https://steve-xmh.github.io/amll-ttml-tool/)来使用本工具的在线版本。

也可以使用 Github Action 构建的 Tauri 桌面版本，具体见 [Github Action 构建 Tauri 桌面版本](https://github.com/Steve-xmh/amll-ttml-tool/actions/workflows/build-test.yaml)。

## 编辑器功能

- 基本输入、编辑、打轴功能
- 读取保存 TTML 格式歌词
- 配置歌词行行为（背景歌词、对唱歌词等）
- 配置歌词文件元数据（名称，作者，网易云音乐 ID 等）
- 拆分/组合/移动单词
- LRC/ESLyric/YRC/QRC/Lyricify Syllable 等歌词文件格式的导入导出
- 支持带有特殊标识符的纯文本导入歌词
- 可配置的快捷键
- 可以编写插件扩展 AMLL TTML Tools 的功能

## 开发构建

本工具构建可能相对比较复杂，如果文字描述太过繁杂的话可以直接参考 [`build-web.yaml`](.github/workflows/build-web.yaml) 工作流的步骤自行进行。

首先，本项目仅可使用 PNPM，请确保你已经安装好了 PNPM 包管理器！

然后克隆本仓库，然后在仓库文件夹下执行构建：

```bash
pnpm i # 安装依赖
pnpm dev # 开启开发服务器
pnpm build # 构建网页版本
pnpm tauri dev # 开启 Tauri 桌面版本开发环境
pnpm tauri build # 构建 Tauri 桌面版本
```

## 截图

<img width="912" alt="image" src="https://github.com/Steve-xmh/amll-ttml-tool/assets/39523898/e12220b5-0490-43da-bbbe-44ea2d64eef3">
<img width="912" alt="image" src="https://github.com/Steve-xmh/amll-ttml-tool/assets/39523898/53b74012-ed11-405c-8411-59bc2036abb9">

## 贡献

欢迎各种积极的代码/翻译贡献！也欢迎积极提交各种议题和建议！

如果想要提供新的语言翻译，可以参考 [`./src/i18n/index.ts`](./src/i18n/index.ts) 和 [`./src/i18n/zh-cn.ts`](./src/i18n/zh-cn.ts) 哦！
