/*
 * Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import {
	Button,
	Checkbox,
	Grid,
	Select,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useAtom, useAtomValue } from "jotai";
import { type FC, useLayoutEffect, useMemo, useState } from "react";
import { uid } from "uid";
import {
	currentLyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
} from "../../states";
import { msToTimestamp, parseTimespan } from "../../utils/timestamp";
import type { LyricLine, LyricWord } from "../../utils/ttml-types";
import { RibbonFrame, RibbonSection } from "./common";

function EditField<
	L extends Word extends true ? LyricWord : LyricLine,
	F extends keyof L,
	Word extends boolean | undefined = undefined,
>({
	label,
	isWordField,
	fieldName,
	formatter,
	parser,
}: {
	label: string;
	isWordField?: Word;
	fieldName: F;
	formatter: (v: L[F]) => string;
	parser: (v: string) => L[F];
}) {
	const [fieldInput, setFieldInput] = useState<string | undefined>(undefined);
	const itemAtom = useMemo(
		() => (isWordField ? selectedWordsAtom : selectedLinesAtom),
		[isWordField],
	);
	const selectedItems = useAtomValue(itemAtom);

	const [lyricLines, editLyricLines] = useAtom(currentLyricLinesAtom);

	const currentValue = useMemo(() => {
		if (selectedItems.size) {
			if (isWordField) {
				const selectedWords = selectedItems as Set<string>;
				const values = new Set();
				for (const line of lyricLines.lyricLines) {
					for (const word of line.words) {
						if (selectedWords.has(word.id)) {
							values.add(word[fieldName as keyof LyricWord]);
						}
					}
				}
				if (values.size === 1)
					return formatter(values.values().next().value as L[F]);
				return "多个值...";
			}
			const selectedLines = selectedItems as Set<string>;
			const values = new Set();
			for (const line of lyricLines.lyricLines) {
				if (selectedLines.has(line.id)) {
					values.add(line[fieldName as keyof LyricLine]);
				}
			}
			if (values.size === 1)
				return formatter(values.values().next().value as L[F]);
			return "多个值...";
		}
		return undefined;
	}, [selectedItems, fieldName, formatter, isWordField, lyricLines]);

	useLayoutEffect(() => {
		setFieldInput(currentValue);
	}, [currentValue]);

	return (
		<>
			<Text wrap="nowrap" size="1">
				{label}
			</Text>
			<TextField.Root
				size="1"
				style={{ width: "8em" }}
				value={fieldInput ?? ""}
				disabled={fieldInput === undefined}
				onChange={(evt) => setFieldInput(evt.target.value)}
				onBlur={(evt) => {
					if (evt.target.value === currentValue) return;
					try {
						const value = parser(evt.target.value);
						editLyricLines((state) => {
							for (const line of state.lyricLines) {
								if (isWordField) {
									for (const word of line.words) {
										if (selectedItems.has(word.id)) {
											(word as L)[fieldName] = value;
										}
									}
								} else {
									if (selectedItems.has(line.id)) {
										(line as L)[fieldName] = value;
									}
								}
							}
							return state;
						});
					} catch {
						setFieldInput(currentValue);
					}
				}}
			/>
		</>
	);
}

export const EditModeRibbonBar: FC = () => {
	const [, editLyricLines] = useAtom(currentLyricLinesAtom);

	return (
		<RibbonFrame>
			<RibbonSection label="插入">
				<Grid
					columns="0fr 1fr 1fr"
					gap="1"
					gapY="1"
					flexGrow="1"
					align="center"
				>
					<Text wrap="nowrap" size="1">
						插入
					</Text>
					<Button size="1" variant="soft">
						行
					</Button>
					<Button size="1" variant="soft">
						词
					</Button>
					<Text wrap="nowrap" size="1">
						加入
					</Text>
					<Button
						size="1"
						variant="soft"
						onClick={() =>
							editLyricLines((state) => {
								state.lyricLines.push({
									id: uid(),
									words: [],
									translatedLyric: "",
									romanLyric: "",
									startTime: 0,
									endTime: 0,
									isBG: false,
									isDuet: false,
								});
							})
						}
					>
						行
					</Button>
					<Button
						size="1"
						variant="soft"
						onClick={() =>
							editLyricLines((state) => {
								if (state.lyricLines.length > 0) {
									state.lyricLines[state.lyricLines.length - 1].words.push({
										id: uid(),
										word: "",
										startTime: 0,
										endTime: 0,
										wordType: "normal",
										obscene: false,
										emptyBeat: 0,
									});
								} else {
									state.lyricLines.push({
										id: uid(),
										words: [
											{
												id: uid(),
												word: "",
												startTime: 0,
												endTime: 0,
												wordType: "normal",
												obscene: false,
												emptyBeat: 0,
											},
										],
										translatedLyric: "",
										romanLyric: "",
										startTime: 0,
										endTime: 0,
										isBG: false,
										isDuet: false,
									});
								}
							})
						}
					>
						词
					</Button>
				</Grid>
			</RibbonSection>
			<RibbonSection label="行时间戳">
				<Grid columns="0fr 1fr" gap="2" gapY="1" flexGrow="1" align="center">
					<EditField
						label="起始时间"
						fieldName="startTime"
						parser={parseTimespan}
						formatter={msToTimestamp}
					/>
					<EditField
						label="结束时间"
						fieldName="endTime"
						parser={parseTimespan}
						formatter={msToTimestamp}
					/>
				</Grid>
			</RibbonSection>
			<RibbonSection label="词时间戳">
				<Grid columns="0fr 1fr" gap="2" gapY="1" flexGrow="1" align="center">
					<EditField
						label="起始时间"
						fieldName="startTime"
						isWordField
						parser={parseTimespan}
						formatter={msToTimestamp}
					/>
					<EditField
						label="结束时间"
						fieldName="endTime"
						isWordField
						parser={parseTimespan}
						formatter={msToTimestamp}
					/>
					<EditField
						label="空拍数量"
						fieldName="emptyBeat"
						isWordField
						parser={Number.parseInt}
						formatter={String}
					/>
				</Grid>
			</RibbonSection>
			<RibbonSection label="内容">
				<Grid columns="0fr 1fr" gap="2" gapY="1" flexGrow="1" align="center">
					<EditField
						label="单词内容"
						fieldName="word"
						isWordField
						parser={(v) => v}
						formatter={(v) => v}
					/>
					<Text wrap="nowrap" size="1">
						单词类型
					</Text>
					<Select.Root size="1" defaultValue="none">
						<Select.Trigger />
						<Select.Content>
							<Select.Item value="none">普通</Select.Item>
							<Select.Item value="ruby">注音原词</Select.Item>
							<Select.Item value="rt">注音发音</Select.Item>
						</Select.Content>
					</Select.Root>
					<Text wrap="nowrap" size="1">
						不雅用语
					</Text>
					<Checkbox />
				</Grid>
			</RibbonSection>
		</RibbonFrame>
	);
};

export default EditModeRibbonBar;
