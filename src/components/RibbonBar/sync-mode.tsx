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

import {keySyncEndAtom, keySyncNextAtom, keySyncStartAtom,} from "$/states/keybindings.ts";
import {currentEmptyBeatAtom, showTouchSyncPanelAtom, visualizeTimestampUpdateAtom,} from "$/states/sync.ts";
import {Checkbox, Flex, Grid, Slider, Text, TextField} from "@radix-ui/themes";
import {useAtom} from "jotai";
import {type FC, forwardRef} from "react";
import {KeyBinding} from "../KeyBinding/index.tsx";
import {RibbonFrame, RibbonSection} from "./common";
import {useCurrentLocation} from "$/utils/lyric-states.ts";

export const SyncModeRibbonBar: FC = forwardRef<HTMLDivElement>(
	(_props, ref) => {
		const [visualizeTimestampUpdate, setVisualizeTimestampUpdate] = useAtom(
			visualizeTimestampUpdateAtom,
		);
		const [showTouchSyncPanel, setShowTouchSyncPanel] = useAtom(
			showTouchSyncPanelAtom,
		);
		const [currentEmptyBeat, setCurrentEmptyBeat] =
			useAtom(currentEmptyBeatAtom);
		const currentWordEmptyBeat = useCurrentLocation()?.word.emptyBeat || 0;

		return (
			<RibbonFrame ref={ref}>
				<RibbonSection label="打轴调整">
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
						<Text wrap="nowrap" size="1">
							当前空拍
						</Text>
						<Slider
							value={[currentEmptyBeat]}
							onValueChange={(v) => setCurrentEmptyBeat(v[0])}
							min={0}
							max={currentWordEmptyBeat}
							step={1}
							disabled={currentWordEmptyBeat === 0}
						/>
						<div/>
						<Text wrap="nowrap" align="center" size="1">
							{currentEmptyBeat} / {currentWordEmptyBeat}
						</Text>
					</Grid>
				</RibbonSection>
				<RibbonSection label="辅助设置">
					<Grid columns="0fr 0fr" gap="2" gapY="1" flexGrow="1" align="center">
						<Text wrap="nowrap" size="1">
							呈现时间戳更新
						</Text>
						<Checkbox
							checked={visualizeTimestampUpdate}
							onCheckedChange={(v) => setVisualizeTimestampUpdate(!!v)}
						/>

						<Text wrap="nowrap" size="1">
							触控打轴辅助面板
						</Text>
						<Checkbox
							checked={showTouchSyncPanel}
							onCheckedChange={(v) => setShowTouchSyncPanel(!!v)}
						/>
					</Grid>
				</RibbonSection>
				<RibbonSection label="打轴键位速查">
					<Flex gap="4">
						<Grid
							columns="0fr 0fr"
							gap="2"
							gapY="1"
							flexGrow="1"
							align="center"
							justify="center"
						>
							<Text wrap="nowrap" size="1">
								起始轴
							</Text>
							<KeyBinding kbdAtom={keySyncStartAtom} />
							<Text wrap="nowrap" size="1">
								连续轴
							</Text>
							<KeyBinding kbdAtom={keySyncNextAtom} />
							<Text wrap="nowrap" size="1">
								结束轴
							</Text>
							<KeyBinding kbdAtom={keySyncEndAtom} />
						</Grid>
					</Flex>
				</RibbonSection>
			</RibbonFrame>
		);
	},
);

export default SyncModeRibbonBar;
