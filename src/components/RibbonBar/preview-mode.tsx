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

import { Checkbox, Grid, Text, TextField } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import {
	hideObsceneWordsAtom,
	lyricWordFadeWidthAtom,
	showRomanLinesAtom,
	showTranslationLinesAtom,
} from "$/modules/settings/states/preview";
import { RibbonFrame, RibbonSection } from "./common";

export const PreviewModeRibbonBar = forwardRef<HTMLDivElement>(
	(_props, ref) => {
		const [showTranslationLine, setShowTranslationLine] = useAtom(
			showTranslationLinesAtom,
		);
		const [showRomanLine, setShowRomanLine] = useAtom(showRomanLinesAtom);
		const [hideObsceneWords, setHideObsceneWords] =
			useAtom(hideObsceneWordsAtom);
		const [lyricWordFadeWidth, setLyricWordFadeWidth] = useAtom(
			lyricWordFadeWidthAtom,
		);
		const { t } = useTranslation();

		return (
			<RibbonFrame ref={ref}>
				<RibbonSection label={t("ribbonBar.previewMode.lyrics", "歌词")}>
					<Grid columns="0fr 0fr" gap="2" gapY="1" flexGrow="1" align="center">
						<Text wrap="nowrap" size="1">
							{t("ribbonBar.previewMode.showTranslation", "显示翻译")}
						</Text>
						<Checkbox
							checked={showTranslationLine}
							onCheckedChange={(v) => setShowTranslationLine(!!v)}
						/>
						<Text wrap="nowrap" size="1">
							{t("ribbonBar.previewMode.showRoman", "显示音译")}
						</Text>
						<Checkbox
							checked={showRomanLine}
							onCheckedChange={(v) => setShowRomanLine(!!v)}
						/>
						<Text wrap="nowrap" size="1">
							{t("ribbonBar.previewMode.maskObsceneWords", "屏蔽不雅用语")}
						</Text>
						<Checkbox
							checked={hideObsceneWords}
							onCheckedChange={(v) => setHideObsceneWords(!!v)}
						/>
					</Grid>
				</RibbonSection>
				<RibbonSection label={t("ribbonBar.previewMode.word", "单词")}>
					<Grid columns="0fr 0fr" gap="2" gapY="1" flexGrow="1" align="center">
						<Text wrap="nowrap" size="1">
							{t("ribbonBar.previewMode.fadeWidth", "过渡宽度")}
						</Text>
						<TextField.Root
							min={0}
							step={0}
							size="1"
							style={{
								width: "4em",
							}}
							defaultValue={lyricWordFadeWidth}
							onBlur={(e) => {
								const value = Number.parseFloat(e.target.value);
								if (Number.isFinite(value)) {
									setLyricWordFadeWidth(value);
								}
							}}
						/>
					</Grid>
				</RibbonSection>
			</RibbonFrame>
		);
	},
);

export default PreviewModeRibbonBar;
