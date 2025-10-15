import { lyricLinesAtom, selectedLinesAtom } from "$/states/main";
import { newLyricLine } from "$/utils/ttml-types";
import { ContextMenu } from "@radix-ui/themes";
import { atom, useAtomValue } from "jotai";
import { useSetImmerAtom } from "jotai-immer";
import * as React from "react";

const selectedLinesSizeAtom = atom((get) => get(selectedLinesAtom).size);

export const LyricLineMenu = ({ lineIndex }: { lineIndex: number }) => {
	const selectedLinesSize = useAtomValue(selectedLinesSizeAtom);
	const selectedLines = useAtomValue(selectedLinesAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);

	const lines = useAtomValue(lyricLinesAtom).lyricLines.filter((line) =>
		selectedLines.has(line.id),
	);

	const [Bgchecked, setBgChecked] = React.useState(() => {
		if (lines.every((line) => line.isBG)) return true;
		else if (lines.every((line) => !line.isBG)) return false;
		else return "indeterminate" as const;
	});
	const [DuetChecked, setDuetChecked] = React.useState(() => {
		if (lines.every((line) => line.isDuet)) return true;
		else if (lines.every((line) => !line.isDuet)) return false;
		else return "indeterminate" as const;
	});

	function bgOnCheck(checked: boolean) {
		setBgChecked(checked);
		editLyricLines((state) => {
			const lines = state.lyricLines.filter((line) =>
				selectedLines.has(line.id),
			);
			for (const line of lines) line.isBG = checked;
		});
	}
	function duetOnCheck(checked: boolean) {
		setDuetChecked(checked);
		editLyricLines((state) => {
			const lines = state.lyricLines.filter((line) =>
				selectedLines.has(line.id),
			);
			for (const line of lines) line.isDuet = checked;
		});
	}

	return (
		<>
			<ContextMenu.CheckboxItem checked={Bgchecked} onCheckedChange={bgOnCheck}>
				背景歌词
			</ContextMenu.CheckboxItem>
			<ContextMenu.CheckboxItem
				checked={DuetChecked}
				onCheckedChange={duetOnCheck}
			>
				对唱歌词
			</ContextMenu.CheckboxItem>
			<ContextMenu.Separator />
			<ContextMenu.Item
				onClick={() => {
					editLyricLines((state) => {
						state.lyricLines.splice(lineIndex, 0, newLyricLine());
					});
				}}
			>
				在之前插入新行
			</ContextMenu.Item>
			<ContextMenu.Item
				onClick={() => {
					editLyricLines((state) => {
						state.lyricLines.splice(lineIndex + 1, 0, newLyricLine());
					});
				}}
			>
				在之后插入新行
			</ContextMenu.Item>
			<ContextMenu.Item
				onClick={() => {
					editLyricLines((state) => {
						if (selectedLinesSize === 0) {
							state.lyricLines.splice(lineIndex, 1);
						} else {
							state.lyricLines = state.lyricLines.filter(
								(line) => !selectedLines.has(line.id),
							);
						}
					});
				}}
			>
				删除所选行
			</ContextMenu.Item>
		</>
	);
};
