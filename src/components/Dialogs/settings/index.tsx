import { SyncJudgeMode, syncJudgeModeAtom } from "$/states/config.ts";
import { settingsDialogAtom } from "$/states/dialogs.ts";
import {
	Button,
	Dialog,
	Flex,
	Heading,
	Select,
	Separator,
	Text,
} from "@radix-ui/themes";
import { useAtom } from "jotai";
import { memo } from "react";
import { BUILD_TIME, GIT_COMMIT } from "virtual:buildmeta";

export const SettingsDialog = memo(() => {
	const [settingsDialogOpen, setSettingsDialogOpen] =
		useAtom(settingsDialogAtom);

	const [syncJudgeMode, setSyncJudgeMode] = useAtom(syncJudgeModeAtom);

	return (
		<Dialog.Root open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
			<Dialog.Content>
				<Dialog.Title>首选项</Dialog.Title>
				<Text as="label">
					<Flex direction="column" gap="2" align="start">
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
				<Separator size="4" my="4" />
				<Dialog.Title>关于</Dialog.Title>
				<Text as="div">Apple Music-like lyrics TTML Tools</Text>
				<Text as="div" size="2" mb="4">
					By SteveXMH
				</Text>
				<Text as="div" size="2" color="gray">
					构建日期：{BUILD_TIME}
				</Text>
				<Text as="div" size="2" color="gray">
					Git 提交：
					{GIT_COMMIT === "unknown" ? (
						"unknown"
					) : (
						<Button asChild variant="ghost">
							<a
								href={`https://github.com/Steve-xmh/amll-ttml-tool/commit/${GIT_COMMIT}`}
								target="_blank"
								rel="noreferrer"
							>
								{GIT_COMMIT}
							</a>
						</Button>
					)}
				</Text>
			</Dialog.Content>
		</Dialog.Root>
	);
});
