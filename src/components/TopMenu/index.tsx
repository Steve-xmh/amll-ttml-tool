import { ImportExportLyric } from "$/components/TopMenu/import-export-lyric.tsx";
import {
	metadataEditorDialogAtom,
	settingsDialogAtom,
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
	lyricLinesAtom,
	newLyricLinesAtom,
	saveFileNameAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	undoableLyricLinesAtom,
} from "$/states/main.ts";
import { formatKeyBindings, useKeyBindingAtom } from "$/utils/keybindings.ts";
import { parseLyric } from "$/utils/ttml-parser.ts";
import exportTTMLText from "$/utils/ttml-writer.ts";
import { HomeRegular } from "@fluentui/react-icons";
import { DropdownMenu, Flex, IconButton, TextField } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-shell";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { type FC, useCallback } from "react";
import { Trans } from "react-i18next";
import saveFile from "save-file";

export const TopMenu: FC = () => {
	const [saveFileName, setSaveFileName] = useAtom(saveFileNameAtom);
	const newLyricLine = useSetAtom(newLyricLinesAtom);
	const setLyricLines = useSetAtom(lyricLinesAtom);
	const setMetadataEditorOpened = useSetAtom(metadataEditorDialogAtom);
	const setSettingsDialogOpened = useSetAtom(settingsDialogAtom);
	const undoLyricLines = useAtomValue(undoableLyricLinesAtom);
	const store = useStore();

	const onNewFile = useCallback(() => {
		newLyricLine();
	}, [newLyricLine]);
	const newFileKey = useKeyBindingAtom(keyNewFileAtom, onNewFile, [onNewFile]);

	const onOpenFile = useCallback(() => {
		const inputEl = document.createElement("input");
		inputEl.type = "file";
		inputEl.accept = ".ttml,*/*";
		inputEl.addEventListener(
			"change",
			async () => {
				const file = inputEl.files?.[0];
				if (!file) return;
				try {
					const ttmlText = await file.text();
					const ttmlData = parseLyric(ttmlText);
					setLyricLines(ttmlData);
					setSaveFileName(file.name);
				} catch (e) {
					console.error("Failed to parse TTML file", e);
				}
			},
			{
				once: true,
			},
		);
		inputEl.click();
	}, [setLyricLines, setSaveFileName]);
	const openFileKey = useKeyBindingAtom(keyOpenFileAtom, onOpenFile, [
		onOpenFile,
	]);

	const onOpenFileFromClipboard = async () => {
		try {
			const ttmlText = await navigator.clipboard.readText();
			const ttmlData = parseLyric(ttmlText);
			setLyricLines(ttmlData);
		} catch (e) {
			console.error("Failed to parse TTML file from clipboard", e);
		}
	};

	const onSaveFile = useCallback(() => {
		try {
			saveFile(exportTTMLText(store.get(lyricLinesAtom)), saveFileName).catch(
				console.error,
			);
		} catch (e) {
			console.error("Failed to save TTML file", e);
		}
	}, [saveFileName, store]);
	const saveFileKey = useKeyBindingAtom(keySaveFileAtom, onSaveFile, [
		onSaveFile,
	]);

	const onSaveFileToClipboard = async () => {
		try {
			const lyric = store.get(lyricLinesAtom);
			const ttml = exportTTMLText(lyric);
			await navigator.clipboard.writeText(ttml);
		} catch (e) {
			console.error("Failed to save TTML file into clipboard", e);
		}
	};

	const onUndo = useCallback(() => {
		undoLyricLines.undo();
	}, [undoLyricLines]);
	const undoKey = useKeyBindingAtom(keyUndoAtom, onUndo, [onUndo]);

	const onRedo = useCallback(() => {
		undoLyricLines.redo();
	}, [undoLyricLines]);
	const redoKey = useKeyBindingAtom(keyRedoAtom, onRedo, [onRedo]);

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
			console.log(tmpWordIds);
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
		console.log(selectedWordIds, selectedLineIds);
		if (selectedWordIds.size === 0) {
			// 删除选中的行
			store.set(lyricLinesAtom, (prev) => {
				prev.lyricLines = prev.lyricLines.filter(
					(l) => !selectedLineIds.has(l.id),
				);
				return prev;
			});
		} else {
			// 删除选中的单词
			store.set(lyricLinesAtom, (prev) => {
				for (const line of prev.lyricLines) {
					line.words = line.words.filter((w) => !selectedWordIds.has(w.id));
				}
				return prev;
			});
		}
		store.set(selectedWordsAtom, new Set());
		store.set(selectedLinesAtom, new Set());
	}, [store]);
	const deleteSelectionKey = useKeyBindingAtom(
		keyDeleteSelectionAtom,
		onDeleteSelection,
		[onDeleteSelection],
	);

	return (
		<Flex p="2" pr="0" align="center" gap="2">
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
								onClick={onNewFile}
								shortcut={formatKeyBindings(newFileKey)}
							>
								新建 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={onOpenFile}
								shortcut={formatKeyBindings(openFileKey)}
							>
								打开 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item onClick={onOpenFileFromClipboard}>
								从剪切板打开 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={onSaveFile}
								shortcut={formatKeyBindings(saveFileKey)}
							>
								保存 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item onClick={onSaveFileToClipboard}>
								保存 TTML 文件到剪切板
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<ImportExportLyric />
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>

					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>
							<Trans i18nKey="topBar.menu.edit">编辑</Trans>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<DropdownMenu.Item
								onClick={onUndo}
								shortcut={formatKeyBindings(undoKey)}
								disabled={undoLyricLines.canUndo}
							>
								撤销
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={onRedo}
								shortcut={formatKeyBindings(redoKey)}
								disabled={undoLyricLines.canRedo}
							>
								重做
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onClick={onSelectAll}
								shortcut={formatKeyBindings(selectAllLinesKey)}
							>
								全选
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={onSelectInverted}
								shortcut={formatKeyBindings(selectInvertedLinesKey)}
							>
								反选
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={onSelectWordsOfMatchedSelection}
								shortcut={formatKeyBindings(selectWordsOfMatchedSelectionKey)}
							>
								选择单词匹配项
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onClick={onDeleteSelection}
								shortcut={formatKeyBindings(deleteSelectionKey)}
							>
								删除所选
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onClick={() => setMetadataEditorOpened(true)}>
								编辑元数据
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onClick={() => setSettingsDialogOpened(true)}>
								首选项
							</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>

					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>
							<Trans i18nKey="topBar.menu.help">帮助</Trans>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<DropdownMenu.Item
								onClick={async () => {
									if (import.meta.env.TAURI_ENV_PLATFORM) {
										await open("https://github.com/Steve-xmh/amll-ttml-tool");
									} else {
										window.open("https://github.com/Steve-xmh/amll-ttml-tool");
									}
								}}
							>
								GitHub
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={async () => {
									if (import.meta.env.TAURI_ENV_PLATFORM) {
										await open(
											"https://github.com/Steve-xmh/amll-ttml-tool/wiki",
										);
									} else {
										window.open(
											"https://github.com/Steve-xmh/amll-ttml-tool/wiki",
										);
									}
								}}
							>
								使用说明
							</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<TextField.Root
				style={{
					flexBasis: "20em",
				}}
				mr="2"
				placeholder="文件名"
				value={saveFileName}
				onChange={(e) => {
					setSaveFileName(e.target.value);
				}}
			/>
		</Flex>
	);
};
