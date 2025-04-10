import { SyncJudgeMode, syncJudgeModeAtom } from "$/states/config.ts";
import { settingsDialogAtom } from "$/states/dialogs.ts";
import { Dialog, Flex, Select, Text } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { memo } from "react";

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
			</Dialog.Content>
		</Dialog.Root>
	);
});
