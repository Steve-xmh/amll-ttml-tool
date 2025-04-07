/*
 * Copyright 2023-2025 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import {
	lyricLinesAtom,
	selectedLinesAtom,
	selectedWordsAtom,
} from "$/states/main.ts";
import { msToTimestamp, parseTimespan } from "$/utils/timestamp.ts";
import {
	type LyricLine,
	type LyricWord,
	newLyricLine,
} from "$/utils/ttml-types.ts";
import { Button, Checkbox, Grid, Text, TextField } from "@radix-ui/themes";
import { atom, useAtomValue, useSetAtom, useStore } from "jotai";
import { useSetImmerAtom } from "jotai-immer";
import {
	type FC,
	forwardRef,
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
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
	textFieldStyle,
}: {
	label: string;
	isWordField?: Word;
	fieldName: F;
	formatter: (v: L[F]) => string;
	parser: (v: string) => L[F];
	textFieldStyle?: React.CSSProperties;
}) {
	const [fieldInput, setFieldInput] = useState<string | undefined>(undefined);
	const [fieldPlaceholder, setFieldPlaceholder] = useState<string>("");
	const itemAtom = useMemo(
		() => (isWordField ? selectedWordsAtom : selectedLinesAtom),
		[isWordField],
	);

	const editLyricLines = useSetImmerAtom(lyricLinesAtom);

	const currentValueAtom = useMemo(
		() =>
			atom((get) => {
				const selectedItems = get(itemAtom);
				const lyricLines = get(lyricLinesAtom);
				if (selectedItems.size === 0) return undefined;

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
						return {
							multiplieValues: false,
							value: formatter(values.values().next().value as L[F]),
						} as const;
					return {
						multiplieValues: true,
						value: "",
					} as const;
				}
				const selectedLines = selectedItems as Set<string>;
				const values = new Set();
				for (const line of lyricLines.lyricLines) {
					if (selectedLines.has(line.id)) {
						values.add(line[fieldName as keyof LyricLine]);
					}
				}
				if (values.size === 1)
					return {
						multiplieValues: false,
						value: formatter(values.values().next().value as L[F]),
					} as const;
				return {
					multiplieValues: true,
					value: "",
				} as const;
			}),
		[fieldName, formatter, isWordField, itemAtom],
	);
	const currentValue = useAtomValue(currentValueAtom);
	const store = useStore();

	const onInputFinished = useCallback(
		(rawValue: string) => {
			try {
				const selectedItems = store.get(itemAtom);
				const value = parser(rawValue);
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
			} catch (err) {
				console.warn("EditField.onInputFinished", err);
				setFieldInput(currentValue?.value);
			}
		},
		[
			itemAtom,
			store,
			editLyricLines,
			currentValue,
			fieldName,
			isWordField,
			parser,
		],
	);

	useLayoutEffect(() => {
		// console.log("EditField.useLayoutEffect currentValue Updated", currentValue);
		setFieldInput(currentValue?.value);
		if (currentValue?.multiplieValues) {
			setFieldPlaceholder("多个值...");
		} else {
			setFieldPlaceholder("");
		}
	}, [currentValue?.value, currentValue?.multiplieValues]);

	return (
		<>
			<Text wrap="nowrap" size="1">
				{label}
			</Text>
			<TextField.Root
				size="1"
				style={{ width: "8em", ...textFieldStyle }}
				value={fieldInput ?? ""}
				placeholder={fieldPlaceholder}
				disabled={fieldInput === undefined}
				onChange={(evt) => setFieldInput(evt.currentTarget.value)}
				onKeyDown={(evt) => {
					if (evt.key !== "Enter") return;
					// console.log("EditField.onKeyDown", evt);
					onInputFinished(evt.currentTarget.value);
				}}
				onBlur={(evt) => {
					if (evt.currentTarget.value === currentValue?.value) return;
					// console.log("EditField.onBlur", evt);
					onInputFinished(evt.currentTarget.value);
				}}
			/>
		</>
	);
}

function CheckboxField<
	L extends Word extends true ? LyricWord : LyricLine,
	F extends keyof L,
	V extends L[F] extends boolean ? boolean : never,
	Word extends boolean | undefined = undefined,
>({
	label,
	isWordField,
	fieldName,
	defaultValue,
}: {
	label: string;
	isWordField: Word;
	fieldName: F;
	defaultValue: V;
}) {
	const itemAtom = useMemo(
		() => (isWordField ? selectedWordsAtom : selectedLinesAtom),
		[isWordField],
	);
	const selectedItems = useAtomValue(itemAtom);

	const lyricLines = useAtomValue(lyricLinesAtom);
	const editLyricLines = useSetImmerAtom(lyricLinesAtom);

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
					return {
						multipleValues: false,
						value: values.values().next().value as L[F],
					} as const;
				return {
					multipleValues: true,
					value: "",
				} as const;
			}
			const selectedLines = selectedItems as Set<string>;
			const values = new Set();
			for (const line of lyricLines.lyricLines) {
				if (selectedLines.has(line.id)) {
					values.add(line[fieldName as keyof LyricLine]);
				}
			}
			if (values.size === 1)
				return {
					multipleValues: false,
					value: values.values().next().value as L[F],
				} as const;
			return {
				multipleValues: true,
				value: "",
			} as const;
		}
		return undefined;
	}, [selectedItems, fieldName, isWordField, lyricLines]);

	return (
		<>
			<Text wrap="nowrap" size="1">
				{label}
			</Text>
			<Checkbox
				disabled={selectedItems.size === 0}
				checked={
					currentValue
						? currentValue.multipleValues
							? "indeterminate"
							: (currentValue.value as boolean)
						: defaultValue
				}
				onCheckedChange={(value) => {
					if (value === "indeterminate") return;
					editLyricLines((state) => {
						for (const line of state.lyricLines) {
							if (isWordField) {
								for (const word of line.words) {
									if (selectedItems.has(word.id)) {
										(word as L)[fieldName] = value as L[F];
									}
								}
							} else {
								if (selectedItems.has(line.id)) {
									(line as L)[fieldName] = value as L[F];
								}
							}
						}
						return state;
					});
				}}
			/>
		</>
	);
}

// function DropdownField<
// 	L extends Word extends true ? LyricWord : LyricLine,
// 	F extends keyof L,
// 	Word extends boolean | undefined = undefined,
// >({
// 	label,
// 	isWordField,
// 	fieldName,
// 	children,
// 	defaultValue,
// }: {
// 	label: string;
// 	isWordField: Word;
// 	fieldName: F;
// 	defaultValue: L[F];
// 	children?: ReactNode | undefined;
// }) {
// 	const itemAtom = useMemo(
// 		() => (isWordField ? selectedWordsAtom : selectedLinesAtom),
// 		[isWordField],
// 	);
// 	const selectedItems = useAtomValue(itemAtom);

// 	const [lyricLines, editLyricLines] = useAtom(currentLyricLinesAtom);

// 	const currentValue = useMemo(() => {
// 		if (selectedItems.size) {
// 			if (isWordField) {
// 				const selectedWords = selectedItems as Set<string>;
// 				const values = new Set();
// 				for (const line of lyricLines.lyricLines) {
// 					for (const word of line.words) {
// 						if (selectedWords.has(word.id)) {
// 							values.add(word[fieldName as keyof LyricWord]);
// 						}
// 					}
// 				}
// 				if (values.size === 1)
// 					return {
// 						multiplieValues: false,
// 						value: values.values().next().value as L[F],
// 					} as const;
// 				return {
// 					multiplieValues: true,
// 					value: "",
// 				} as const;
// 			}
// 			const selectedLines = selectedItems as Set<string>;
// 			const values = new Set();
// 			for (const line of lyricLines.lyricLines) {
// 				if (selectedLines.has(line.id)) {
// 					values.add(line[fieldName as keyof LyricLine]);
// 				}
// 			}
// 			if (values.size === 1)
// 				return {
// 					multiplieValues: false,
// 					value: values.values().next().value as L[F],
// 				} as const;
// 			return {
// 				multiplieValues: true,
// 				value: "",
// 			} as const;
// 		}
// 		return undefined;
// 	}, [selectedItems, fieldName, isWordField, lyricLines]);

// 	return (
// 		<>
// 			<Text wrap="nowrap" size="1">
// 				{label}
// 			</Text>
// 			<Select.Root
// 				size="1"
// 				disabled={selectedItems.size === 0}
// 				defaultValue={defaultValue as string}
// 				value={(currentValue?.value as string) ?? ""}
// 				onValueChange={(value) => {
// 					editLyricLines((state) => {
// 						for (const line of state.lyricLines) {
// 							if (isWordField) {
// 								for (const word of line.words) {
// 									if (selectedItems.has(word.id)) {
// 										(word as L)[fieldName] = value as L[F];
// 									}
// 								}
// 							} else {
// 								if (selectedItems.has(line.id)) {
// 									(line as L)[fieldName] = value as L[F];
// 								}
// 							}
// 						}
// 						return state;
// 					});
// 				}}
// 			>
// 				<Select.Trigger
// 					placeholder={selectedItems.size > 0 ? "多个值..." : undefined}
// 				/>
// 				<Select.Content>{children}</Select.Content>
// 			</Select.Root>
// 		</>
// 	);
// }

export const EditModeRibbonBar: FC = forwardRef<HTMLDivElement>(
	(_props, ref) => {
		const editLyricLines = useSetAtom(lyricLinesAtom);

		return (
			<RibbonFrame ref={ref}>
				<RibbonSection label="新建">
					<Grid columns="1" gap="1" gapY="1" flexGrow="1" align="center">
						<Button
							size="1"
							variant="soft"
							onClick={() =>
								editLyricLines((prev) => {
									return {
										...prev,
										lyricLines: [...prev.lyricLines, newLyricLine()],
									};
								})
							}
						>
							歌词行
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
				<RibbonSection label="行属性">
					<Grid columns="0fr 1fr" gap="2" gapY="1" flexGrow="1" align="center">
						<CheckboxField
							label="背景歌词"
							isWordField={false}
							fieldName="isBG"
							defaultValue={false}
						/>
						<CheckboxField
							label="对唱歌词"
							isWordField={false}
							fieldName="isDuet"
							defaultValue={false}
						/>
						<CheckboxField
							label="忽略打轴"
							isWordField={false}
							fieldName="ignoreSync"
							defaultValue={false}
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
				<RibbonSection label="单词属性">
					<Grid columns="0fr 1fr" gap="2" gapY="1" flexGrow="1" align="center">
						<EditField
							label="单词内容"
							fieldName="word"
							isWordField
							parser={(v) => v}
							formatter={(v) => v}
						/>
						<CheckboxField
							label="不雅用语"
							isWordField
							fieldName="obscene"
							defaultValue={false}
						/>
					</Grid>
				</RibbonSection>
				<RibbonSection label="次要内容">
					<Grid columns="0fr 1fr" gap="2" gapY="1" flexGrow="1" align="center">
						<EditField
							label="翻译歌词"
							fieldName="translatedLyric"
							parser={(v) => v}
							formatter={(v) => v}
							textFieldStyle={{ width: "20em" }}
						/>
						<EditField
							label="音译歌词"
							fieldName="romanLyric"
							parser={(v) => v}
							formatter={(v) => v}
							textFieldStyle={{ width: "20em" }}
						/>
					</Grid>
				</RibbonSection>
			</RibbonFrame>
		);
	},
);

export default EditModeRibbonBar;
