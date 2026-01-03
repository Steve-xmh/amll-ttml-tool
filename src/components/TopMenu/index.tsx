import { HomeRegular } from "@fluentui/react-icons";
import { Box, Button, DropdownMenu, Flex, IconButton } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-shell";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { useSetImmerAtom, withImmer } from "jotai-immer";
import { Toolbar } from "radix-ui";
import { type FC, useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import saveFile from "save-file";
import { uid } from "uid";
import { ImportExportLyric } from "$/components/TopMenu/import-export-lyric.tsx";
import { useFileOpener } from "$/hooks/useFileOpener.ts";
import type { SegmentationConfig } from "$/modules/segmentation/types";
import { segmentWord } from "$/modules/segmentation/utils/segmentation";
import {
	advancedSegmentationDialogAtom,
	confirmDialogAtom,
	historyRestoreDialogAtom,
	latencyTestDialogAtom,
	metadataEditorDialogAtom,
	settingsDialogAtom,
	submitToAMLLDBDialogAtom,
	timeShiftDialogAtom,
} from "$/states/dialogs.ts";
import {
	keyDeleteSelectionAtom,
	keyNewFileAtom,
	keyOpenFileAtom,
	keyRedoAtom,
	keySaveFileAtom,
	keySelectAllAtom,
	keySelectInvertedAtom,
	keySelectWordsOfMatchedSelectionAtom,
	keyUndoAtom,
} from "$/states/keybindings.ts";
import {
	isDirtyAtom,
	lyricLinesAtom,
	newLyricLinesAtom,
	projectIdAtom,
	redoLyricLinesAtom,
	saveFileNameAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	undoableLyricLinesAtom,
	undoLyricLinesAtom,
} from "$/states/main.ts";
import { formatKeyBindings, useKeyBindingAtom } from "$/utils/keybindings.ts";
import { error, log } from "$/utils/logging.ts";
import exportTTMLText from "$/utils/ttml-writer.ts";
import { HeaderFileInfo } from "./HeaderFileInfo";

const useWindowSize = () => {
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowSize;
};

export const TopMenu: FC = () => {
	const { width } = useWindowSize();
	const showHomeButton = width < 800;
	const [saveFileName, setSaveFileName] = useAtom(saveFileNameAtom);
	const newLyricLine = useSetAtom(newLyricLinesAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
	const setMetadataEditorOpened = useSetAtom(metadataEditorDialogAtom);
	const setSettingsDialogOpened = useSetAtom(settingsDialogAtom);
	const undoLyricLines = useAtomValue(undoableLyricLinesAtom);
	const store = useStore();
	const { t } = useTranslation();
	const isDirty = useAtomValue(isDirtyAtom);
	const setConfirmDialog = useSetAtom(confirmDialogAtom);
	const setHistoryRestoreDialog = useSetAtom(historyRestoreDialogAtom);
	const setAdvancedSegmentationDialog = useSetAtom(
		advancedSegmentationDialogAtom,
	);
	const setTimeShiftDialog = useSetAtom(timeShiftDialogAtom);
	const { openFile } = useFileOpener();
	const setProjectId = useSetAtom(projectIdAtom);

	const onNewFile = useCallback(() => {
		const action = () => {
			newLyricLine();
			setProjectId(uid());
			setSaveFileName("lyric.ttml");
		};

		if (isDirty) {
			setConfirmDialog({
				open: true,
				title: t("confirmDialog.newFile.title", "确认新建文件"),
				description: t(
					"confirmDialog.newFile.description",
					"当前文件有未保存的更改。如果继续，这些更改将会丢失。确定要新建文件吗？",
				),
				onConfirm: action,
			});
		} else {
			action();
		}
	}, [
		isDirty,
		newLyricLine,
		setConfirmDialog,
		t,
		setProjectId,
		setSaveFileName,
	]);

	const newFileKey = useKeyBindingAtom(keyNewFileAtom, onNewFile, [onNewFile]);

	const onOpenFile = useCallback(() => {
		const inputEl = document.createElement("input");
		inputEl.type = "file";
		inputEl.accept = ".ttml,.lrc,.qrc,.eslrc,.lys,.yrc,*/*";
		inputEl.addEventListener(
			"change",
			() => {
				const file = inputEl.files?.[0];
				if (!file) return;
				openFile(file);
			},
			{
				once: true,
			},
		);
		inputEl.click();
	}, [openFile]);

	const openFileKey = useKeyBindingAtom(keyOpenFileAtom, onOpenFile, [
		onOpenFile,
	]);

	const onOpenFileFromClipboard = useCallback(async () => {
		try {
			const ttmlText = await navigator.clipboard.readText();
			const file = new File([ttmlText], "lyric.ttml", {
				type: "application/xml",
			});
			openFile(file);
		} catch (e) {
			error("Failed to parse TTML file from clipboard", e);
		}
	}, [openFile]);

	const onSaveFile = useCallback(() => {
		try {
			const ttmlText = exportTTMLText(store.get(lyricLinesAtom));
			const b = new Blob([ttmlText], { type: "text/plain" });
			saveFile(b, saveFileName).catch(error);
		} catch (e) {
			error("Failed to save TTML file", e);
		}
	}, [saveFileName, store]);
	const saveFileKey = useKeyBindingAtom(keySaveFileAtom, onSaveFile, [
		onSaveFile,
	]);

	const onSaveFileToClipboard = useCallback(async () => {
		try {
			const lyric = store.get(lyricLinesAtom);
			const ttml = exportTTMLText(lyric);
			await navigator.clipboard.writeText(ttml);
		} catch (e) {
			error("Failed to save TTML file into clipboard", e);
		}
	}, [store]);

	const onSubmitToAMLLDB = useCallback(() => {
		store.set(submitToAMLLDBDialogAtom, true);
	}, [store]);

	const onOpenMetadataEditor = useCallback(() => {
		setMetadataEditorOpened(true);
	}, [setMetadataEditorOpened]);

	const onOpenSettings = useCallback(() => {
		setSettingsDialogOpened(true);
	}, [setSettingsDialogOpened]);

	const onOpenLatencyTest = useCallback(() => {
		store.set(latencyTestDialogAtom, true);
	}, [store]);

	const onOpenGitHub = useCallback(async () => {
		if (import.meta.env.TAURI_ENV_PLATFORM) {
			await open("https://github.com/Steve-xmh/amll-ttml-tool");
		} else {
			window.open("https://github.com/Steve-xmh/amll-ttml-tool");
		}
	}, []);

	const onOpenWiki = useCallback(async () => {
		if (import.meta.env.TAURI_ENV_PLATFORM) {
			await open("https://github.com/Steve-xmh/amll-ttml-tool/wiki");
		} else {
			window.open("https://github.com/Steve-xmh/amll-ttml-tool/wiki");
		}
	}, []);

	const onUndo = useCallback(() => {
		store.set(undoLyricLinesAtom);
	}, [store]);
	const undoKey = useKeyBindingAtom(keyUndoAtom, onUndo, [onUndo]);

	const onRedo = useCallback(() => {
		store.set(redoLyricLinesAtom);
	}, [store]);
	const redoKey = useKeyBindingAtom(keyRedoAtom, onRedo, [onRedo]);

	const onUnselectAll = useCallback(() => {
		const immerSelectedLinesAtom = withImmer(selectedLinesAtom);
		const immerSelectedWordsAtom = withImmer(selectedWordsAtom);
		store.set(immerSelectedLinesAtom, (old) => {
			old.clear();
		});
		store.set(immerSelectedWordsAtom, (old) => {
			old.clear();
		});
	}, [store]);
	const unselectAllLinesKey = useKeyBindingAtom(
		keySelectAllAtom,
		onUnselectAll,
		[onUnselectAll],
	);

	const onSelectAll = useCallback(() => {
		const lines = store.get(lyricLinesAtom).lyricLines;
		const selectedLineIds = store.get(selectedLinesAtom);
		const selectedLines = lines.filter((l) => selectedLineIds.has(l.id));
		const selectedWordIds = store.get(selectedWordsAtom);
		const selectedWords = lines
			.flatMap((l) => l.words)
			.filter((w) => selectedWordIds.has(w.id));
		if (selectedWords.length > 0) {
			const tmpWordIds = new Set(selectedWordIds);
			for (const selLine of selectedLines) {
				for (const word of selLine.words) {
					tmpWordIds.delete(word.id);
				}
			}
			if (tmpWordIds.size === 0) {
				// 选中所有单词
				store.set(
					selectedWordsAtom,
					new Set(selectedLines.flatMap((line) => line.words.map((w) => w.id))),
				);
				return;
			}
		} else {
			// 选中所有歌词行
			store.set(
				selectedLinesAtom,
				new Set(store.get(lyricLinesAtom).lyricLines.map((l) => l.id)),
			);
		}
		const sel = window.getSelection();
		if (sel) {
			if (sel.empty) {
				// Chrome
				sel.empty();
			} else if (sel.removeAllRanges) {
				// Firefox
				sel.removeAllRanges();
			}
		}
	}, [store]);
	const selectAllLinesKey = useKeyBindingAtom(keySelectAllAtom, onSelectAll, [
		onSelectAll,
	]);

	const onSelectInverted = useCallback(() => {}, []);
	const selectInvertedLinesKey = useKeyBindingAtom(
		keySelectInvertedAtom,
		onSelectInverted,
		[onSelectInverted],
	);

	const onSelectWordsOfMatchedSelection = useCallback(() => {}, []);
	const selectWordsOfMatchedSelectionKey = useKeyBindingAtom(
		keySelectWordsOfMatchedSelectionAtom,
		onSelectWordsOfMatchedSelection,
		[onSelectWordsOfMatchedSelection],
	);

	const onDeleteSelection = useCallback(() => {
		const selectedWordIds = store.get(selectedWordsAtom);
		const selectedLineIds = store.get(selectedLinesAtom);
		log("deleting selections", selectedWordIds, selectedLineIds);
		if (selectedWordIds.size === 0) {
			// 删除选中的行
			editLyricLines((prev) => {
				prev.lyricLines = prev.lyricLines.filter(
					(l) => !selectedLineIds.has(l.id),
				);
			});
		} else {
			// 删除选中的单词
			editLyricLines((prev) => {
				for (const line of prev.lyricLines) {
					line.words = line.words.filter((w) => !selectedWordIds.has(w.id));
				}
			});
		}
		store.set(selectedWordsAtom, new Set());
		store.set(selectedLinesAtom, new Set());
	}, [store, editLyricLines]);
	const deleteSelectionKey = useKeyBindingAtom(
		keyDeleteSelectionAtom,
		onDeleteSelection,
		[onDeleteSelection],
	);

	const onAutoSegment = useCallback(() => {
		const config: SegmentationConfig = {
			splitCJK: true,
			splitEnglish: true,
			punctuationMode: "merge",
			punctuationWeight: 0.2,
			removeEmptySegments: true,
			ignoreList: new Set(),
			customRules: new Map(),
		};

		editLyricLines((draft) => {
			for (const line of draft.lyricLines) {
				line.words = line.words.flatMap((word) => segmentWord(word, config));
			}
		});
	}, [editLyricLines]);

	const onOpenTimeShift = useCallback(() => {
		setTimeShiftDialog(true);
	}, [setTimeShiftDialog]);

	return (
		<Flex
			p="2"
			pr="0"
			align="center"
			gap="2"
			style={{
				whiteSpace: "nowrap",
			}}
		>
			{showHomeButton ? (
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<IconButton variant="soft">
							<HomeRegular />
						</IconButton>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Trans i18nKey="topBar.menu.file">文件</Trans>
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								<DropdownMenu.Item
									onSelect={onNewFile}
									shortcut={formatKeyBindings(newFileKey)}
								>
									<Trans i18nKey="topBar.menu.newLyric">新建 TTML 文件</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onSelect={onOpenFile}
									shortcut={formatKeyBindings(openFileKey)}
								>
									<Trans i18nKey="topBar.menu.openLyric">打开 TTML 文件</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={onOpenFileFromClipboard}>
									<Trans i18nKey="topBar.menu.openFromClipboard">
										从剪切板打开 TTML 文件
									</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onSelect={onSaveFile}
									shortcut={formatKeyBindings(saveFileKey)}
								>
									<Trans i18nKey="topBar.menu.saveLyric">保存 TTML 文件</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item
									onSelect={() => setHistoryRestoreDialog(true)}
								>
									{t("topBar.menu.restoreFromHistory", "从历史记录恢复...")}
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onSelect={onSaveFileToClipboard}>
									<Trans i18nKey="topBar.menu.saveLyricToClipboard">
										保存 TTML 文件到剪切板
									</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<ImportExportLyric />
								<DropdownMenu.Separator />
								<DropdownMenu.Item onSelect={onSubmitToAMLLDB}>
									<Trans i18nKey="topBar.menu.uploadToAMLLDB">
										上传到 AMLL 歌词数据库
									</Trans>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Trans i18nKey="topBar.menu.edit">编辑</Trans>
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								<DropdownMenu.Item
									onSelect={onUndo}
									shortcut={formatKeyBindings(undoKey)}
									disabled={!undoLyricLines.canUndo}
								>
									<Trans i18nKey="topBar.menu.undo">撤销</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onSelect={onRedo}
									shortcut={formatKeyBindings(redoKey)}
									disabled={!undoLyricLines.canRedo}
								>
									<Trans i18nKey="topBar.menu.redo">重做</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item
									onSelect={onSelectAll}
									shortcut={formatKeyBindings(selectAllLinesKey)}
								>
									<Trans i18nKey="topBar.menu.selectAllLines">
										选中所有歌词行
									</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onSelect={onUnselectAll}
									shortcut={formatKeyBindings(unselectAllLinesKey)}
								>
									<Trans i18nKey="topBar.menu.unselectAllLines">
										取消选中所有歌词行
									</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onSelect={onSelectInverted}
									shortcut={formatKeyBindings(selectInvertedLinesKey)}
								>
									<Trans i18nKey="topBar.menu.invertSelectAllLines">
										反选所有歌词行
									</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onSelect={onSelectWordsOfMatchedSelection}
									shortcut={formatKeyBindings(selectWordsOfMatchedSelectionKey)}
								>
									<Trans i18nKey="topBar.menu.selectWordsOfMatchedSelection">
										选择单词匹配项
									</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item
									onSelect={onDeleteSelection}
									shortcut={formatKeyBindings(deleteSelectionKey)}
								>
									<Trans i18nKey="contextMenu.deleteWords">删除选定单词</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onSelect={onOpenTimeShift}>
									{t("topBar.menu.timeShift", "平移时间...")}
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onSelect={onOpenMetadataEditor}>
									<Trans i18nKey="topBar.menu.editMetadata">
										编辑歌词元数据
									</Trans>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onSelect={onOpenSettings}>
									<Trans i18nKey="settingsDialog.title">首选项</Trans>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Trans i18nKey="topBar.menu.tool">工具</Trans>
							</DropdownMenu.SubTrigger>

							<DropdownMenu.SubContent>
								<DropdownMenu.Sub>
									<DropdownMenu.SubTrigger>
										{t("topBar.menu.segmentationTools", "分词")}
									</DropdownMenu.SubTrigger>
									<DropdownMenu.SubContent>
										<DropdownMenu.Item onSelect={onAutoSegment}>
											{t("topBar.menu.autoSegment", "自动分词")}
										</DropdownMenu.Item>
										<DropdownMenu.Item
											onSelect={() => setAdvancedSegmentationDialog(true)}
										>
											{t("topBar.menu.advancedSegment", "高级分词...")}
										</DropdownMenu.Item>
									</DropdownMenu.SubContent>
								</DropdownMenu.Sub>

								<DropdownMenu.Item onSelect={onOpenLatencyTest}>
									{t("settingsDialog.common.latencyTest", "音频/输入延迟测试")}
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Trans i18nKey="topBar.menu.help">帮助</Trans>
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								<DropdownMenu.Item onSelect={onOpenGitHub}>
									GitHub
								</DropdownMenu.Item>
								<DropdownMenu.Item onSelect={onOpenWiki}>
									{t("topBar.menu.helpDoc", "使用说明")}
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			) : (
				<Toolbar.Root>
					<DropdownMenu.Root>
						<Toolbar.Button asChild>
							<DropdownMenu.Trigger>
								<Button
									variant="soft"
									style={{
										borderTopRightRadius: "0",
										borderBottomRightRadius: "0",
										marginRight: "0px",
									}}
								>
									<Trans i18nKey="topBar.menu.file">文件</Trans>
								</Button>
							</DropdownMenu.Trigger>
						</Toolbar.Button>
						<DropdownMenu.Content>
							<DropdownMenu.Item
								onSelect={onNewFile}
								shortcut={formatKeyBindings(newFileKey)}
							>
								{t("topBar.menu.newLyric", "新建 TTML 文件")}
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onOpenFile}
								shortcut={formatKeyBindings(openFileKey)}
							>
								{t("topBar.menu.openLyric", "打开 TTML 文件")}
							</DropdownMenu.Item>
							<DropdownMenu.Item onSelect={onOpenFileFromClipboard}>
								{t("topBar.menu.openFromClipboard", "从剪切板打开 TTML 文件")}
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onSaveFile}
								shortcut={formatKeyBindings(saveFileKey)}
							>
								{t("topBar.menu.saveLyric", "保存 TTML 文件")}
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={() => setHistoryRestoreDialog(true)}>
								{t("topBar.menu.restoreFromHistory", "从历史记录恢复...")}
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={onSaveFileToClipboard}>
								{t(
									"topBar.menu.saveLyricToClipboard",
									"保存 TTML 文件到剪切板",
								)}
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<ImportExportLyric />
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={onSubmitToAMLLDB}>
								{t("topBar.menu.uploadToAMLLDB", "上传到 AMLL 歌词数据库")}
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<DropdownMenu.Root>
						<Toolbar.Button asChild>
							<DropdownMenu.Trigger
								style={{
									borderRadius: "0",
									marginRight: "0px",
								}}
							>
								<Button variant="soft">
									<Trans i18nKey="topBar.menu.edit">编辑</Trans>
								</Button>
							</DropdownMenu.Trigger>
						</Toolbar.Button>
						<DropdownMenu.Content>
							<DropdownMenu.Item
								onSelect={onUndo}
								shortcut={formatKeyBindings(undoKey)}
								disabled={!undoLyricLines.canUndo}
							>
								<Trans i18nKey="topBar.menu.undo">撤销</Trans>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onRedo}
								shortcut={formatKeyBindings(redoKey)}
								disabled={!undoLyricLines.canRedo}
							>
								<Trans i18nKey="topBar.menu.redo">重做</Trans>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onSelect={onSelectAll}
								shortcut={formatKeyBindings(selectAllLinesKey)}
							>
								<Trans i18nKey="topBar.menu.selectAllLines">
									选中所有歌词行
								</Trans>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onUnselectAll}
								shortcut={formatKeyBindings(unselectAllLinesKey)}
							>
								<Trans i18nKey="topBar.menu.unselectAllLines">
									取消选中所有歌词行
								</Trans>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onSelectInverted}
								shortcut={formatKeyBindings(selectInvertedLinesKey)}
							>
								<Trans i18nKey="topBar.menu.invertSelectAllLines">
									反选所有歌词行
								</Trans>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onSelectWordsOfMatchedSelection}
								shortcut={formatKeyBindings(selectWordsOfMatchedSelectionKey)}
							>
								<Trans i18nKey="topBar.menu.selectWordsOfMatchedSelection">
									选择单词匹配项
								</Trans>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onSelect={onDeleteSelection}
								shortcut={formatKeyBindings(deleteSelectionKey)}
							>
								<Trans i18nKey="contextMenu.deleteWords">删除选定单词</Trans>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={onOpenTimeShift}>
								{t("topBar.menu.timeShift", "平移时间...")}
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={onOpenMetadataEditor}>
								<Trans i18nKey="topBar.menu.editMetadata">编辑歌词元数据</Trans>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={onOpenSettings}>
								<Trans i18nKey="settingsDialog.title">首选项</Trans>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<DropdownMenu.Root>
						<Toolbar.Button asChild>
							<DropdownMenu.Trigger>
								<Button
									variant="soft"
									style={{
										borderRadius: "0",
										marginRight: "0px",
									}}
								>
									{t("topBar.menu.tool", "工具")}
								</Button>
							</DropdownMenu.Trigger>
						</Toolbar.Button>
						<DropdownMenu.Content>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>
									{t("topBar.menu.segmentationTools", "分词")}
								</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent>
									<DropdownMenu.Item onSelect={onAutoSegment}>
										{t("topBar.menu.autoSegment", "自动分词")}
									</DropdownMenu.Item>
									<DropdownMenu.Item
										onSelect={() => setAdvancedSegmentationDialog(true)}
									>
										{t("topBar.menu.advancedSegment", "高级分词...")}
									</DropdownMenu.Item>
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
							<DropdownMenu.Item onSelect={onOpenLatencyTest}>
								{t("settingsDialog.common.latencyTest", "音频/输入延迟测试")}
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<DropdownMenu.Root>
						<Toolbar.Button asChild>
							<DropdownMenu.Trigger>
								<Button
									variant="soft"
									style={{
										borderTopLeftRadius: "0",
										borderBottomLeftRadius: "0",
									}}
								>
									<Trans i18nKey="topBar.menu.help">帮助</Trans>
								</Button>
							</DropdownMenu.Trigger>
						</Toolbar.Button>
						<DropdownMenu.Content>
							<DropdownMenu.Item onSelect={onOpenGitHub}>
								GitHub
							</DropdownMenu.Item>
							<DropdownMenu.Item onSelect={onOpenWiki}>
								{t("topBar.menu.helpDoc", "使用说明")}
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Toolbar.Root>
			)}
			<Box style={{ marginLeft: "16px" }}>
				<HeaderFileInfo />
			</Box>
		</Flex>
	);
};
