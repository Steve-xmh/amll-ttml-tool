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

import { Checkbox, Grid, Text, TextField } from "@radix-ui/themes";
import { type FC, forwardRef } from "react";
import { RibbonFrame, RibbonSection } from "./common";

export const SyncModeRibbonBar: FC = forwardRef<HTMLDivElement>(
	(_props, ref) => {
		return (
			<RibbonFrame ref={ref}>
				<RibbonSection label="时序调整">
					<Grid columns="0fr 0fr" gap="2" gapY="1" flexGrow="1" align="center">
						<Text wrap="nowrap" size="1">
							时间戳位移
						</Text>
						<TextField.Root
							type="number"
							step={1}
							size="1"
							style={{
								width: "8em",
							}}
						/>
					</Grid>
				</RibbonSection>
				<RibbonSection label="辅助设置">
					<Grid columns="0fr 0fr" gap="2" gapY="1" flexGrow="1" align="center">
						<Text wrap="nowrap" size="1">
							呈现时间戳更新
						</Text>
						<Checkbox />
					</Grid>
				</RibbonSection>
			</RibbonFrame>
		);
	},
);

export default SyncModeRibbonBar;
