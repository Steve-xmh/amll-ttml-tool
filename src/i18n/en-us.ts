export const zhCN = {
	app: {
		loadingEditPage: "Loading Page Edit",
		loadingSyncPage: "Loading Page Sync",
		loadingAMLLPreviewPage: "Loading Page AMLL Lyrics Preview",
	},
	topBar: {
		menu: {
			file: "File",
			edit: "Edit",
			view: "View",
			tool: "Tool",
		},
		modeBtns: {
			edit: "Edit Mode",
			sync: "Sync Mode",
			preview: "Preview Mode",
		},
		appName: "Apple Music-like Lyrics TTML Tool",
	},
	aboutModal: {
		// 原则上不翻译这里的应用名称
		appName: "Apple Music-like Lyrics TTML Tool",
		description: "A Word-by-Word TTML Editing and Timeline Tool for Apple Music Lyrics",
		githubBtn: "Github",
		tutorialBtn: "Quick Tutorial",
	},
	contextMenu: {
		deleteLine: "Delete selected line",
		insertBeforeLine: "New line before selected",
		insertAfterLine: "New line after selected",
		toggleBGLine: "Toggle Background Voice for line",
		toggleDuetLine: "Toggle Duet for line",
		deleteWord: "Delete this word",
		splitWord: "Split this word",
		wipNotification: {
			title: "Function currently not available",
			content: "Give us some time and we'll give you back a new sky~",
		},
	},
	lyricEditor: {
		addNewLineBtn: "New line",
	},
	lyricLineEditor: {
		newWordPlaceholder: "New word",
		translateLinePlaceholder: "Translation",
		romanLinePlaceholder: "Romaji",
	},
	lyricSyncEditor: {
		unselectedTip: ["No lyrics selected", "Click on a line below to start syncing"].join(
			"\n",
		),
	},
	lyricWordEditor: {
		empty: "Blank",
		space: "空格x{0}", // 空格x（空格数量）
	},
	serviceWorkerUpdater: {
		needRefresh: {
			title: "Editor Updated! ",
			content: "Please click to update Editor",
			updateBtn: "Update",
		},
		offlineReady: {
			title: "Offline saved",
			content: "No Internet required to continue your here! ",
		},
	},
	audioPlayerBar: {
		loadMusicBtn: "Load music",
	},
	lyricInfoModal: {
		saveBtn: "Save",
	},
	progressOverlay: {
		title: "Processing",
	},
	splitWordModal: {
		title: "Split word",
		splitBtn: "Split",
	},
	uploadDBDialog: {
		title: "Commit lyrics to AMLL Vault (Netease Cloud Music only)",
		ncmOnlyWarning:
			"This function is only for the users who use AMLL plugin for Netease Cloud Music. If you are making lyrics and plan to upload to other applications, please do so by their functions instead of here. ",
		content: [
			"We appreciate your contributions of lyrics. ",
			"By uploading, you are agreed to {0} and upload your content to our database! ",
			"And your content may be used as the default TTML lyrics by the plugin. ",
			"If you decided to keep your copyright of your content, please cancel. ",
			"Fill out the form and we are taking you to the issue page on Github. ",
		].join("\n"),
		boldCC0: "According to CC0 agreement, completely give up on the copyright of the content",
		musicName: "Track name",
		musicNamePlaceholder: "Track name",
		musicNameTip:
			"Artist - Track, that's the recommended format. ",
		ncmID: "Track ID on Netease Cloud Music",
		ncmIDPlaceholder: "Track ID",
		ncmIDTip: [
			"It is copiable by right click on the AMLL plugin on Netease Cloud Music and it should be digital. ",
			"If you are uploading the same lyrics to multiple tracks, please split IDs by comma(,)",
		].join("\n"),
		uploadReason: {
			label: "Cause of uploading",
			newLyric: "New lyrics",
			patchLyric: "A Fix",
		},
		comment: "Comment",
		commentPlaceholder: "Comment",
		commentTip: "Is there anything more we should know about?",
		uploadBtn: "Upload and redirect to commit",
		errors: {
			noLyricContent: "Nothing we found in the lyrics",
		},
		errorNotification: {
			title: "Failed to commit lyrics",
			content: "Details: \n{0}",
		},
	},
	tutorial: {
		title: "Welcome to Apple Music-like Lyrics TTML Tool",
		content: [
            "This TTML lyrics tool is designed for Apple Music-like Lyrics playing page of BetterNCM plugin. ",
            "We provide multiple functions for making various kinds of lyrics. ",
			"Check out our quick tutorial, we'll get you there soon: ",
		].join("\n"),
		wipWarning:
			"This tool is still in development, please always save your project. ",
		step1: {
			title: "Load lyrics",
			content: [
				"Lyrics can be loaded by go to File->Upload lyrics file. ",
				"It is okay for lyrics in non-TTML format. LRC/YRC/QRC/Lyricify Syllable formats are acceptable. ",
			].join("\n"),
		},
		step2: {
			title: "Edit lyrics",
			content: [
				"Click the {0} button to edit lyrics (by default). ",
				"You can append a new line, add new words, even split or edit them! ",
				"Please notify that all space will be saved. ",
				"If you want to add translation or romaji, please enable by going to View->Show translation/romaji lyrics. ",
				"If you want to adjust lyrics property (toggle Background Voice or Duet), please right click or go to menu and choose from the list. ",
				"If you want to edit multiple lines at the same time, please check the lines, and go to menu. ",
			].join("\n"),
			editModeBtnExample: "Edit Mode",
		},
		step3: {
			title: "Sync Lyrics",
			content: [
				"Click the {0} button to enable Sync Mode. ",
				"Load your music from file below then start syncing. ",
				"You can also slowdown the track if it goes too fast. ",
				"These are the default keymap of syncing mode: ",
				"{1}",
			].join("\n"),
			syncModeBtnExample: "Sync Mode",
			shortcutsTable: {
				header: {
					key: "Key",
					description: "Description",
				},
				moveToPreviousWord: {
					key: "Key A",
					description: "Move back",
				},
				moveToNextWord: {
					key: "Key D",
					description: "Move next",
				},
				moveToFirstWordOfPreviousLine: {
					key: "Key W",
					description: "Move to the first word of the last line",
				},
				moveToFirstWordOfNextLine: {
					key: "Key S",
					description: "Move to the first word of the next line",
				},
				moveToPreviousWordAndCurrentTime: {
					key: "Key R",
					description: "Move back to last word, and set the current timestamp as the starting of it",
				},
				moveToNextWordAndSetCurrentTime: {
					key: "Key Y",
					description: "Move back to next word, and set the current timestamp as the starting of it",
				},
				setWordStartTimeToCurrentTime: {
					key: "Key F",
					description: "Set current timestamp as the starting of word",
				},
				moveNextAndSetWordTime: {
					key: "Key G",
					description:
						"Set current timestamp as the ending of current word and starting of next word, and move to next word",
				},
				moveNextAndSetWordEndTimeOnly: {
					key: "Key H",
					description:
						"Set current timestamp as the ending of current word, and move to next word (used to make instrumental time)",
				},
				decreasePlaybackSpeed: {
					key: "Key [",
					description: "Play as 0.25x slower",
				},
				increasePlaybackSpeed: {
					key: "Key ]",
					description: "Play as 0.25x faster",
				},
				resetPlaybackSpeed: {
					key: "Key '",
					description: "Reset to default speed",
				},
				resumeOrPauseMusic: {
					key: "Key Space",
					description: "Play/Pause music",
				},
			},
		},
		step4: {
			title: "Save Lyrics",
			content: [
				"You can save lyrics as TTML format, as well as other mainstream formats. ",
				"BUT please remind that currently, translation and romaji will not be saved as Lyricify Syllable. Translations, rumaji and syllable timestamps will not be saved as LRC. Translations, romaji and lyrics property will not be saved as YRC/QRC. ",
			].join("\n"),
		},
		step5: {
			title: "Use Lyrics (Only Netease Cloud Music)",
			ncmOnlyWarning:
				"This step is only for users who use AMLL NetEase Cloud plugin, if you are editing lyrics to use lyrics on other software, please refer to the corresponding software to import and use lyrics to use lyrics! ",
			content: [
				"The last thing to do is to put it in the TTML lyrics folder of the AMLL plugin, name the lyrics file as the song ID of the Netease cloud (you can get it by right-clicking and copying it in the AMLL play page) and then cut the song again to read it!",
				"In order for more people to experience the effects of TTML lyrics, you can also upload your lyrics to {0} for download!",
			].join("\n"),
			amllTtmlDbUrlName: "SteveXMH's TTML Lyrics Vault",
		},
		ending:
			"Afterwards you can revisit this page via the File->About->Quick Tutorial, or come back to it if you have forgotten how to do it!",
		closeBtn: "I see",
	},
};

// 在开发中实现热重载的代码
// 将下面的语言代码换成相对应的即可实现指定语言的热重载
// 注意大小写敏感

import { i18n } from ".";

if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		if (newModule) {
			i18n.global.setLocaleMessage("en-US", newModule.enUS);
		}
	});
}
