import { importFromTextDialogAtom } from "$/states/dialogs.ts";
import { lyricLinesAtom, saveFileNameAtom } from "$/states/main.ts";
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
import { useSetAtom, useStore } from "jotai";
import saveFile from "save-file";
import { uid } from "uid";

export const ImportExportLyric = () => {
	const store = useStore();
	const onImportLyric =
		(parser: (lyric: string) => LyricLine[], extension: string) => () => {
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
						console.error(
							`Failed to import lyric with format "${extension}"`,
							e,
						);
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
				console.error(`Failed to export lyric with format "${extension}"`, e);
			}
		};
	const setImportFromTextDialog = useSetAtom(importFromTextDialogAtom);

	return (
		<>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>导入歌词...</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item onClick={() => setImportFromTextDialog(true)}>
						从纯文本导入
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onImportLyric(parseLrc, "lrc")}>
						从 LyRiC 文件导入
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onImportLyric(parseEslrc, "lrc")}>
						从 ESLyRiC 文件导入
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onImportLyric(parseQrc, "qrc")}>
						从 QRC 文件导入
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onImportLyric(parseYrc, "yrc")}>
						从 YRC 文件导入
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onImportLyric(parseLys, "lys")}>
						从 Lyricify Syllable 文件导入
					</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>导出歌词...</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item onClick={onExportLyric(stringifyLrc, "lrc")}>
						导出到 LyRiC
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyEslrc, "lrc")}>
						导出到 ESLyRiC
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyQrc, "qrc")}>
						导出到 QRC
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyYrc, "yrc")}>
						导出到 YRC
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyLys, "lys")}>
						导出到 Lyricify Syllable
					</DropdownMenu.Item>
					<DropdownMenu.Item onClick={onExportLyric(stringifyAss, "ass")}>
						导出到 ASS 字幕
					</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
		</>
	);
};
