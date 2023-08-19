export const zhCN = {
	app: {
		loadingEditPage: "正在加载编辑页面",
		loadingSyncPage: "正在加载打轴页面",
		loadingAMLLPreviewPage: "正在加载 AMLL 预览页面",
	},
	topBar: {
		menu: {
			file: "文件",
			edit: "编辑",
			view: "查看",
			tool: "工具",
		},
		modeBtns: {
			edit: "编辑模式",
			sync: "打轴模式",
			preview: "预览模式",
		},
		appName: "Apple Music-like Lyrics TTML Tool",
	},
	aboutModal: {
		// 原则上不翻译这里的应用名称
		appName: "Apple Music-like Lyrics TTML Tool",
		description: "一个用于 Apple Music 的逐词歌词 TTML 编辑和时间轴工具",
		githubBtn: "Github",
		tutorialBtn: "简短教程",
	},
	contextMenu: {
		deleteLine: "删除选定歌词行",
		insertBeforeLine: "在选定歌词行前插入新歌词行",
		insertAfterLine: "在选定歌词行后插入新歌词行",
		toggleBGLine: "切换背景人声歌词",
		toggleDuetLine: "切换对唱人声歌词",
		deleteWord: "删除选定单词",
		splitWord: "切割当前单词",
		wipNotification: {
			title: "功能暂未实现",
			content: "请静候作者爆肝实现吧~",
		},
	},
	lyricEditor: {
		addNewLineBtn: "添加一行歌词",
	},
	lyricLineEditor: {
		newWordPlaceholder: "新单词",
		translateLinePlaceholder: "翻译歌词",
		romanLinePlaceholder: "音译歌词",
	},
	lyricSyncEditor: {
		unselectedTip: ["尚未选中歌词", "点击下方的歌词行以选中歌词开始打轴"].join(
			"\n",
		),
	},
	lyricWordEditor: {
		empty: "空白",
		space: "空格x{0}", // 空格x（空格数量）
	},
	serviceWorkerUpdater: {
		needRefresh: {
			title: "编辑器已更新！",
			content: "请点击更新按钮以更新编辑器！",
			updateBtn: "更新",
		},
		offlineReady: {
			title: "编辑器已完成离线缓存！",
			content: "现在开始不需要网络也可以访问编辑器了！",
		},
	},
	audioPlayerBar: {
		loadMusicBtn: "加载音乐",
	},
	lyricInfoModal: {
		saveBtn: "保存",
	},
	progressOverlay: {
		title: "处理中",
	},
	splitWordModal: {
		title: "拆分单词",
		splitBtn: "拆分",
	},
	uploadDBDialog: {
		title: "提交歌词到 AMLL 歌词数据库（仅网易云）",
		ncmOnlyWarning:
			"本功能仅使用 AMLL 网易云插件的用户可用，如果您是为了在其他软件上使用歌词而编辑歌词的话，请参考对应的软件提交歌词的方式来提交歌词哦！",
		content: [
			"首先，感谢您的慷慨歌词贡献！",
			"通过提交，你将默认同意 {0} 并提交到歌词数据库！",
			"并且歌词将会在以后被 AMLL 插件作为默认 TTML 歌词源获取！",
			"如果您对歌词所有权比较看重的话，请勿提交歌词哦！",
			"请输入以下提交信息然后跳转到 Github 议题提交页面！",
		].join("\n"),
		boldCC0: "使用 CC0 共享协议完全放弃歌词所有权",
		musicName: "音乐名称",
		musicNamePlaceholder: "音乐名称",
		musicNameTip:
			"推荐使用 歌手 - 歌曲 格式，方便仓库管理员确认你的歌曲是否存在",
		ncmID: "音乐对应的网易云音乐 ID",
		ncmIDPlaceholder: "音乐对应的网易云音乐 ID",
		ncmIDTip: [
			"可以通过在 AMLL 插件内右键复制音乐 ID 得到，应该都是纯数字",
			"如果需要同时提交到多个歌曲上，可以以英文逗号分隔 ID",
		].join("\n"),
		uploadReason: {
			label: "提交缘由",
			newLyric: "新歌词提交",
			patchLyric: "修正已有歌词",
		},
		comment: "备注",
		commentPlaceholder: "备注",
		commentTip: "有什么需要补充说明的呢？",
		uploadBtn: "上传并跳转提交",
		errors: {
			noLyricContent: "歌词还什么都没有呢？",
		},
		errorNotification: {
			title: "歌词提交失败！",
			content: "错误原因：\n{0}",
		},
	},
	tutorial: {
		title: "欢迎使用 Apple Music-like Lyrics TTML 歌词工具！",
		content: [
			"本工具是针对 BetterNCM 插件 Apple Music-like Lyrics 播放页面插件而专门设计的 TTML 歌词工具！",
			"因为功能相对较多，所以也适合用来制作各种格式的歌词哦！",
			"以下是简短的使用方式，希望可以让您快速上手使用它！",
		].join("\n"),
		wipWarning:
			"本工具仍在开发当中，仍有很多缺失的功能和 BUG，请仅用作尝鲜用途，并随时保存你的歌词文件以防万一！",
		step1: {
			title: "加载歌词",
			content: [
				"您可以通过左上角的菜单 - 文件 - 打开歌词来加载歌词哦！",
				"如果您的歌词不是 TTML 格式也没有关系，歌词工具支持从 LRC/YRC/QRC/Lyricify Syllable 格式导入歌词哦！",
			].join("\n"),
		},
		step2: {
			title: "编辑歌词",
			content: [
				"点击上方的 {0} 按钮即可进入编辑模式，一般默认都是编辑模式。",
				"您可以增加新的歌词行，增加新的单词，可以对其拆分，分词，编辑哦！",
				"要留意的是，最后保存的格式会将任何空格都完整保留，所以要留意英文单词的空格间隙哦！",
				"如果需要增加翻译歌词行和音译歌词行，可以通过菜单 查看 - 显示翻译/音译歌词 选项来显示哦！",
				"如果需要标记歌词行的属性（是否为背景人声或对唱人声），可以右键歌词行，选择 切换所选歌词行为背景人声/切换所选歌词行为对唱人声 或者 使用编辑菜单来切换。",
				"如果需要批量操作歌词，可以点击歌词行左侧的选择框来选中歌词行，然后使用编辑菜单的操作批量处理歌词哦！",
			].join("\n"),
			editModeBtnExample: "编辑模式",
		},
		step3: {
			title: "歌词打轴",
			content: [
				"点击上方的 {0} 按钮即可进入打轴模式！",
				"在下方的音乐播放栏里加载好音乐，就可以开始播放打轴了。",
				"如果音乐太快，也可以在音乐播放栏的右侧调节播放速度，这样手就能跟上了~",
				"以下是桌面版本的默认打轴按键设置：",
				"{1}",
			].join("\n"),
			syncModeBtnExample: "打轴模式",
			shortcutsTable: {
				header: {
					key: "按键",
					description: "说明",
				},
				moveToPreviousWord: {
					key: "按键 A",
					description: "移动到上一个单词",
				},
				moveToNextWord: {
					key: "按键 D",
					description: "移动到下一个单词",
				},
				moveToFirstWordOfPreviousLine: {
					key: "按键 W",
					description: "移动到上一行歌词的第一个单词",
				},
				moveToFirstWordOfNextLine: {
					key: "按键 S",
					description: "移动到下一个单词的第一个单词",
				},
				moveToPreviousWordAndCurrentTime: {
					key: "按键 R",
					description: "移动到上一个单词，并设置播放位置为目标单词的​起始时间",
				},
				moveToNextWordAndSetCurrentTime: {
					key: "按键 Y",
					description: "移动到下一个单词，并设置播放位置为目标单词的​起始时间",
				},
				setWordStartTimeToCurrentTime: {
					key: "按键 F",
					description: "记录当前时间为当前单词的起始时间",
				},
				moveNextAndSetWordTime: {
					key: "按键 G",
					description:
						"记录当前时间为当前单词的结束时间和下一个单词的起始时间，并移动到下一个单词",
				},
				moveNextAndSetWordEndTimeOnly: {
					key: "按键 H",
					description:
						"记录当前时间为当前单词的结束时间，并移动到下一个单词（用于空出间奏时间）",
				},
				decreasePlaybackSpeed: {
					key: "按键 [",
					description: "将播放速度降低 0.25x",
				},
				increasePlaybackSpeed: {
					key: "按键 ]",
					description: "将播放速度增加 0.25x",
				},
				resetPlaybackSpeed: {
					key: "按键 '",
					description: "设置播放速度为原速",
				},
				resumeOrPauseMusic: {
					key: "空格",
					description: "播放 / 暂停音乐",
				},
			},
		},
		step4: {
			title: "保存歌词",
			content: [
				"和加载歌词类似，您可以将歌词保存为 TTML 格式，也可以导出到其他主流歌词格式。",
				"但是目前 Lyricify Syllable 格式会丢失翻译和音译文本，导出成 LRC 格式会丢失翻译、音译文本、逐词歌词的单词信息和歌词行属性信息，而导出成 YRC/QRC 格式会丢失翻译、音译文本和歌词行的属性信息，要留意哦！",
			].join("\n"),
		},
		step5: {
			title: "使用歌词（仅网易云）",
			ncmOnlyWarning:
				"本步骤仅使用 AMLL 网易云插件的用户可参考操作，如果您是为了在其他软件上使用歌词而编辑歌词的话，请参考对应的软件导入使用歌词的方式来使用歌词哦！",
			content: [
				"最后就是放到 AMLL 插件的 TTML 歌词文件夹内，将歌词文件命名为网易云的歌曲 ID（可以通过 AMLL 播放页面内右键复制得到）后重新切歌即可读取！",
				"为了让更多人能够体验到 TTML 歌词带来的效果，您也可以将您的歌词上传到 {0} 上，供大家下载使用哦！",
			].join("\n"),
			amllTtmlDbUrlName: "SteveXMH 的 TTML 歌词仓库",
		},
		ending:
			"之后您可以通过左上角的 文件菜单 - 关于 - 简短教程 再次访问本页面，如果忘记怎么操作了可以再来看看哦！",
		closeBtn: "我知道了",
	},
};

// 在开发中实现热重载的代码
// 将下面的语言代码换成相对应的即可实现指定语言的热重载
// 注意大小写敏感

import { i18n } from ".";

if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		if (newModule) {
			i18n.global.setLocaleMessage("zh-CN", newModule.zhCN);
		}
	});
}
