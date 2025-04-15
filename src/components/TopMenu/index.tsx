import { ImportExportLyric } from "$/components/TopMenu/import-export-lyric.tsx";
import {
	latencyTestDialogAtom,
	metadataEditorDialogAtom,
	settingsDialogAtom,
	submitToAMLLDBDialogAtom,
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
	redoLyricLinesAtom,
	saveFileNameAtom,
	selectedLinesAtom,
	selectedWordsAtom,
	undoLyricLinesAtom,
	undoableLyricLinesAtom,
} from "$/states/main.ts";
import { formatKeyBindings, useKeyBindingAtom } from "$/utils/keybindings.ts";
import { parseLyric } from "$/utils/ttml-parser.ts";
import { type LyricWord, newLyricWord } from "$/utils/ttml-types";
import exportTTMLText from "$/utils/ttml-writer.ts";
import { HomeRegular } from "@fluentui/react-icons";
import { DropdownMenu, Flex, IconButton, TextField } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-shell";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { useSetImmerAtom } from "jotai-immer";
import { type FC, useCallback } from "react";
import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import saveFile from "save-file";

export const TopMenu: FC = () => {
	const [saveFileName, setSaveFileName] = useAtom(saveFileNameAtom);
	const newLyricLine = useSetAtom(newLyricLinesAtom);
	const setLyricLines = useSetAtom(lyricLinesAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);
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
			const ttmlText = exportTTMLText(store.get(lyricLinesAtom));
			const b = new Blob([ttmlText], { type: "text/plain" });
			saveFile(b, saveFileName).catch(console.error);
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
		store.set(undoLyricLinesAtom);
	}, [store]);
	const undoKey = useKeyBindingAtom(keyUndoAtom, onUndo, [onUndo]);

	const onRedo = useCallback(() => {
		store.set(redoLyricLinesAtom);
	}, [store]);
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
		console.log("deleting selections", selectedWordIds, selectedLineIds);
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
								onSelect={onNewFile}
								shortcut={formatKeyBindings(newFileKey)}
							>
								新建 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onOpenFile}
								shortcut={formatKeyBindings(openFileKey)}
							>
								打开 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item onSelect={onOpenFileFromClipboard}>
								从剪切板打开 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onSaveFile}
								shortcut={formatKeyBindings(saveFileKey)}
							>
								保存 TTML 文件
							</DropdownMenu.Item>
							<DropdownMenu.Item onSelect={onSaveFileToClipboard}>
								保存 TTML 文件到剪切板
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<ImportExportLyric />
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onSelect={() => store.set(submitToAMLLDBDialogAtom, true)}
							>
								上传到 AMLL 歌词数据库
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
								disabled={undoLyricLines.canUndo}
							>
								撤销
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onRedo}
								shortcut={formatKeyBindings(redoKey)}
								disabled={undoLyricLines.canRedo}
							>
								重做
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onSelect={onSelectAll}
								shortcut={formatKeyBindings(selectAllLinesKey)}
							>
								全选
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onSelectInverted}
								shortcut={formatKeyBindings(selectInvertedLinesKey)}
							>
								反选
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={onSelectWordsOfMatchedSelection}
								shortcut={formatKeyBindings(selectWordsOfMatchedSelectionKey)}
							>
								选择单词匹配项
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onSelect={onDeleteSelection}
								shortcut={formatKeyBindings(deleteSelectionKey)}
							>
								删除所选
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={() => setMetadataEditorOpened(true)}>
								编辑元数据
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={() => setSettingsDialogOpened(true)}>
								首选项
							</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>

					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>工具</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>按照算法分词</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent>
									<DropdownMenu.Item
										onSelect={async () => {
											const id = toast("正在加载 Jieba 分词算法模块", {
												autoClose: false,
												isLoading: true,
											});
											try {
												const { default: wasmMoudle } = await import(
													"$/assets/jieba_rs_wasm_bg.wasm?url"
												);
												const { default: init, cut } = await import(
													"jieba-wasm"
												);
												await init({
													module_or_path: wasmMoudle,
												});
												toast.update(id, {
													render: "正在分词中，请稍等...",
												});
												editLyricLines((state) => {
													for (const line of state.lyricLines) {
														const mergedWords = line.words
															.map((w) => w.word)
															.join("");
														const splited = cut(mergedWords, true);
														line.words = [];
														for (const word of splited) {
															line.words.push({
																...newLyricWord(),
																word: word,
															});
														}
													}
												});
												toast.update(id, {
													render: "分词完成！",
													type: "success",
													isLoading: false,
													autoClose: 5000,
												});
											} catch (err) {
												toast.update(id, {
													render: "分词失败，请检查控制台错误输出！",
													type: "error",
													isLoading: false,
													autoClose: 5000,
												});
												console.error(err);
											}
										}}
									>
										Jieba 分词
									</DropdownMenu.Item>
									<DropdownMenu.Item
										onSelect={() => {
											editLyricLines((state) => {
												const latinReg =
													/^[0-9A-z\u00C0-\u00ff'.,-\/#!$%^&*;:{}=\-_`~()]+$/;

												for (const line of state.lyricLines) {
													const chars = line.words.flatMap((w) =>
														w.word.split(""),
													);
													const wordsResult: LyricWord[] = [];
													let tmpWord = newLyricWord();
													for (const c of chars) {
														if (/^\s+$/.test(c)) {
															if (tmpWord.word.trim().length > 0) {
																wordsResult.push(tmpWord);
															}
															tmpWord = {
																...newLyricWord(),
																word: " ",
															};
														} else if (latinReg.test(c)) {
															if (latinReg.test(tmpWord.word)) {
																tmpWord.word += c;
															} else {
																if (tmpWord.word.length > 0) {
																	wordsResult.push(tmpWord);
																}
																tmpWord = {
																	...newLyricWord(),
																	word: c,
																};
															}
														} else {
															if (tmpWord.word.length > 0) {
																wordsResult.push(tmpWord);
															}
															tmpWord = {
																...newLyricWord(),
																word: c,
															};
														}
													}
													if (tmpWord.word.length > 0) {
														wordsResult.push(tmpWord);
													}
													line.words = wordsResult;
												}
											});
										}}
									>
										简单分词
									</DropdownMenu.Item>
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
							<DropdownMenu.Item
								onSelect={() => {
									store.set(latencyTestDialogAtom, true);
								}}
							>
								音频/输入延迟测试
							</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>

					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>
							<Trans i18nKey="topBar.menu.help">帮助</Trans>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<DropdownMenu.Item
								onSelect={async () => {
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
								onSelect={async () => {
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
