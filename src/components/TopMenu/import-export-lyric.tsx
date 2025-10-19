import {
	confirmDialogAtom,
	importFromTextDialogAtom,
} from "$/states/dialogs.ts";
import {
	isDirtyAtom,
	lyricLinesAtom,
	saveFileNameAtom,
} from "$/states/main.ts";
import { error } from "$/utils/logging.ts";
import {
	type LyricLine,
	parseEslrc,
	parseLrc,
	parseLys,
	parseQrc,
	parseYrc,
	stringifyAss,
	stringifyEslrc,
	stringifyLrc,
	stringifyLys,
	stringifyQrc,
	stringifyYrc,
} from "@applemusic-like-lyrics/lyric";
import { DropdownMenu } from "@radix-ui/themes";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { useTranslation } from "react-i18next";
import saveFile from "save-file";
import { uid } from "uid";

export const ImportExportLyric = () => {
	const store = useStore();
	const setConfirmDialog = useSetAtom(confirmDialogAtom);
	const isDirty = useAtomValue(isDirtyAtom);
	const { t } = useTranslation();
	const onImportLyric = (
		parser: (lyric: string) => LyricLine[],
		extension: string,
	) => {
		const inputEl = document.createElement("input");
		inputEl.type = "file";
		inputEl.accept = `.${extension},*/*`;
		inputEl.addEventListener(
			"change",
			async () => {
				const file = inputEl.files?.[0];
				if (!file) return;
				try {
					const lyricText = await file.text();
					const lyricLines = parser(lyricText);
					store.set(lyricLinesAtom, {
						lyricLines: lyricLines.map((line) => ({
							...line,
							words: line.words.map((word) => ({
								...word,
								id: uid(),
								obscene: false,
								emptyBeat: 0,
							})),
							ignoreSync: false,
							id: uid(),
						})),
						metadata: [],
					});
				} catch (e) {
					error(`Failed to import lyric with format "${extension}"`, e);
				}
			},
			{
				once: true,
			},
		);
		inputEl.click();
	};
	const onExportLyric =
		(stringifier: (lines: LyricLine[]) => string, extension: string) =>
		async () => {
			const lyric = store.get(lyricLinesAtom).lyricLines;
			const saveFileName = store.get(saveFileNameAtom);
			const baseName = saveFileName.replace(/\.[^.]*$/, "");
			const fileName = `${baseName}.${extension}`;
			try {
				const data = stringifier(lyric);
				const b = new Blob([data], { type: "text/plain" });
				await saveFile(b, fileName);
			} catch (e) {
				error(`Failed to export lyric with format "${extension}"`, e);
			}
		};
	const setImportFromTextDialog = useSetAtom(importFromTextDialogAtom);

	const onImportLyricWithConfirm: (
		...params: Parameters<typeof onImportLyric>
	) => undefined = (...params) => {
		if (isDirty)
			setConfirmDialog({
				open: true,
				title: t("confirmDialog.importFile.title", "确认导入歌词"),
				description: t(
					"confirmDialog.importFile.description",
					"当前文件有未保存的更改。如果继续，这些更改将会丢失。确定要导入歌词吗？",
				),
				onConfirm: () => onImportLyric(...params),
			});
		else onImportLyric(...params);
	};

	return (
		<>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>
					{t("topBar.menu.importLyric.import", "导入歌词...")}
				</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item onClick={() => setImportFromTextDialog(true)}>
						{t("topBar.menu.importLyric.fromPlainText", "从纯文本导入")}
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onClick={() => onImportLyricWithConfirm(parseLrc, "lrc")}
					>
						{t("topBar.menu.importLyric.fromLyRiC", "从 LyRiC 文件导入")}
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onClick={() => onImportLyricWithConfirm(parseEslrc, "lrc")}
					>
						{t("topBar.menu.importLyric.fromESLyRiC", "从 ESLyRiC 文件导入")}
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onClick={() => onImportLyricWithConfirm(parseQrc, "qrc")}
					>
						{t("topBar.menu.importLyric.fromQRC", "从 QRC 文件导入")}
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onClick={() => onImportLyricWithConfirm(parseYrc, "yrc")}
					>
						{t("topBar.menu.importLyric.fromYRC", "从 YRC 文件导入")}
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onClick={() => onImportLyricWithConfirm(parseLys, "lys")}
					>
						{t(
							"topBar.menu.importLyric.fromLrcfySylb",
							"从 Lyricify Syllable 文件导入",
						)}
					</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>
					{t("topBar.menu.exportLyric.export", "导出歌词...")}
				</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item onClick={onExportLyric(stringifyLrc, "lrc")}>
						{t("topBar.menu.exportLyric.toLyRiC", "导出到 LyRiC")}
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyEslrc, "lrc")}>
						{t("topBar.menu.exportLyric.toESLyRiC", "导出到 ESLyRiC")}
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyQrc, "qrc")}>
						{t("topBar.menu.exportLyric.toQRC", "导出到 QRC")}
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyYrc, "yrc")}>
						{t("topBar.menu.exportLyric.toYRC", "导出到 YRC")}
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyLys, "lys")}>
						{t("topBar.menu.exportLyric.toLrcfySylb", "导出到 Lyricify Syllable")}
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyAss, "ass")}>
						{t("topBar.menu.exportLyric.toASS", "导出到 ASS 字幕")}
					</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
		</>
	);
};
