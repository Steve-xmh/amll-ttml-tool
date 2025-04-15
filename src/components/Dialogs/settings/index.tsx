import { settingsDialogAtom } from "$/states/dialogs.ts";
import { Box, Dialog, Tabs } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { memo } from "react";
import { SettingsAboutTab } from "./about";
import { SettingsCommonTab } from "./common";
import { SettingsKeyBindingsDialog } from "./keybindings";

export const SettingsDialog = memo(() => {
	const [settingsDialogOpen, setSettingsDialogOpen] =
		useAtom(settingsDialogAtom);

	return (
		<Dialog.Root open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
			<Dialog.Content>
				<Dialog.Title>首选项</Dialog.Title>
				<Tabs.Root>
					<Tabs.List>
						<Tabs.Trigger value="common">常规</Tabs.Trigger>
						<Tabs.Trigger value="keybinding">按键绑定</Tabs.Trigger>
						<Tabs.Trigger value="about">关于</Tabs.Trigger>
					</Tabs.List>
					<Box pt="3">
					<Tabs.Content value="common">
						<SettingsCommonTab />
					</Tabs.Content>
					<Tabs.Content value="keybinding">
						<SettingsKeyBindingsDialog />
					</Tabs.Content>
					<Tabs.Content value="about">
						<SettingsAboutTab />
					</Tabs.Content>
					</Box>
				</Tabs.Root>
			</Dialog.Content>
		</Dialog.Root>
	);
});
