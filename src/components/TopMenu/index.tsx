import { HomeRegular } from "@fluentui/react-icons";
import { DropdownMenu, Flex, IconButton, TextField } from "@radix-ui/themes";
import { useAtom, useSetAtom, useStore } from "jotai";
import { type FC, useCallback } from "react";
import { Trans } from "react-i18next";
import saveFile from "save-file";
import {
	keyNewFileAtom,
	keyOpenFileAtom,
	keyRedoAtom,
	keySaveFileAtom,
	keySelectAllAtom,
	keySelectInvertedAtom,
	keySelectWordsOfMatchedSelectionAtom,
	keyUndoAtom,
} from "../../states/keybindings.ts";
import {
	currentLyricLinesAtom,
	newLyricLinesAtom,
	redoLyricLinesAtom,
	saveFileNameAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	undoLyricLinesAtom,
} from "../../states/main.ts";
import {
	formatKeyBindings,
	useKeyBindingAtom,
} from "../../utils/keybindings.ts";
import { parseLyric } from "../../utils/ttml-parser.ts";
import exportTTMLText from "../../utils/ttml-writer.ts";

export const TopMenu: FC = () => {
	const [saveFileName, setSaveFileName] = useAtom(saveFileNameAtom);
	const newLyricLine = useSetAtom(newLyricLinesAtom);
	const editLyricLine = useSetAtom(currentLyricLinesAtom);
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
					editLyricLine(ttmlData);
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
	}, [editLyricLine, setSaveFileName]);
	const openFileKey = useKeyBindingAtom(keyOpenFileAtom, onOpenFile, [
		onOpenFile,
	]);

	const onSaveFile = useCallback(() => {
		try {
			saveFile(
				exportTTMLText(store.get(currentLyricLinesAtom)),
				saveFileName,
			).catch(console.error);
		} catch (e) {
			console.error("Failed to save TTML file", e);
		}
	}, [saveFileName, store]);
	const saveFileKey = useKeyBindingAtom(keySaveFileAtom, onSaveFile, [
		onSaveFile,
	]);

	const onUndo = useCallback(() => {
		store.set(undoLyricLinesAtom);
	}, [store]);
	const undoKey = useKeyBindingAtom(keyUndoAtom, onUndo, [onUndo]);

	const onRedo = useCallback(() => {
		store.set(redoLyricLinesAtom);
	}, [store]);
	const redoKey = useKeyBindingAtom(keyRedoAtom, onRedo, [onRedo]);

	const onSelectAll = useCallback(() => {
		const lines = store.get(currentLyricLinesAtom).lyricLines;
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
				new Set(store.get(currentLyricLinesAtom).lyricLines.map((l) => l.id)),
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
							<DropdownMenu.Item
								onClick={onSaveFile}
								shortcut={formatKeyBindings(saveFileKey)}
							>
								保存 TTML 文件
							</DropdownMenu.Item>
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
							>
								撤销
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={onRedo}
								shortcut={formatKeyBindings(redoKey)}
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
