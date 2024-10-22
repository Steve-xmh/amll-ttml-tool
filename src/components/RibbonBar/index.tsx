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

import { Card, Inset } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import type { FC } from "react";
import { ToolMode, toolModeAtom } from "../../states";
import { EditModeRibbonBar } from "./edit-mode";
import PreviewModeRibbonBar from "./preview-mode";
import SyncModeRibbonBar from "./sync-mode";

export const RibbonBar: FC = () => {
	const toolMode = useAtomValue(toolModeAtom);
	return (
		<Card
			m="2"
			mb="0"
			style={{
				minHeight: "fit-content",
			}}
		>
			<Inset>
				<motion.div layout="size">
					<AnimatePresence mode="wait">
						{toolMode === ToolMode.Edit && <EditModeRibbonBar key="edit" />}
						{toolMode === ToolMode.Sync && <SyncModeRibbonBar key="sync" />}
						{toolMode === ToolMode.Preview && (
							<PreviewModeRibbonBar key="preview" />
						)}
					</AnimatePresence>
				</motion.div>
			</Inset>
		</Card>
	);
};

export default RibbonBar;
