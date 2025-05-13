import { playbackRateAtom, volumeAtom } from "$/states/audio";
import {
	LayoutMode,
	SyncJudgeMode,
	layoutModeAtom,
	syncJudgeModeAtom,
} from "$/states/config.ts";
import { Flex, Select, Slider, Text } from "@radix-ui/themes";
import { useAtom } from "jotai";

export const SettingsCommonTab = () => {
	const [layoutMode, setLayoutMode] = useAtom(layoutModeAtom);
	const [syncJudgeMode, setSyncJudgeMode] = useAtom(syncJudgeModeAtom);
	const [volume, setVolume] = useAtom(volumeAtom);
	const [playbackRate, setPlaybackRate] = useAtom(playbackRateAtom);

	return (
		<>
			<Text as="label">
				<Flex direction="column" gap="2" align="start">
					<Text>编辑布局模式</Text>
					<Text size="1" color="gray">
						简单布局能够满足大部分使用者的基本需求
						<br />
						如果你需要更加高效的打轴的话，可以考虑切换到高级模式
					</Text>
					<Select.Root
						value={layoutMode}
						onValueChange={(v) => setLayoutMode(v as LayoutMode)}
					>
						<Select.Trigger />
						<Select.Content>
							<Select.Item value={LayoutMode.Simple}>简单模式</Select.Item>
							<Select.Item value={LayoutMode.Advance}>高级模式</Select.Item>
						</Select.Content>
					</Select.Root>
				</Flex>
			</Text>

			<Text as="label">
				<Flex direction="column" gap="2" my="3" align="start">
					<Text>打轴时间戳判定模式</Text>
					<Text size="1" color="gray">
						设置打轴时间戳的判定模式，默认为“首个按键按下时间”。
					</Text>
					<Select.Root
						value={syncJudgeMode}
						onValueChange={(v) => setSyncJudgeMode(v as SyncJudgeMode)}
					>
						<Select.Trigger />
						<Select.Content>
							<Select.Item value={SyncJudgeMode.FirstKeyDownTime}>
								首个按键按下时间
							</Select.Item>
							<Select.Item value={SyncJudgeMode.LastKeyUpTime}>
								最后一个按键抬起时间
							</Select.Item>
							<Select.Item value={SyncJudgeMode.MiddleKeyTime}>
								取按键按下和抬起的中间值
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</Flex>
			</Text>

			<Flex direction="column" gap="2" my="3" align="start">
				<Flex align="center" justify="between" style={{ alignSelf: "stretch" }}>
					<Text>音乐音量</Text>
					<Text wrap="nowrap" color="gray" size="1">
						{(volume * 100).toFixed()}%
					</Text>
				</Flex>
				<Slider
					min={0}
					max={1}
					defaultValue={[volume]}
					step={0.01}
					onValueChange={(v) => setVolume(v[0])}
				/>
			</Flex>

			<Flex direction="column" gap="2" my="3" align="start">
				<Flex align="center" justify="between" style={{ alignSelf: "stretch" }}>
					<Text wrap="nowrap">播放速度</Text>
					<Text wrap="nowrap" color="gray" size="1">
						{playbackRate.toFixed(2)}x
					</Text>
				</Flex>
				<Slider
					min={0.05}
					max={2}
					defaultValue={[playbackRate]}
					step={0.05}
					onValueChange={(v) => setPlaybackRate(v[0])}
				/>
			</Flex>
		</>
	);
};
