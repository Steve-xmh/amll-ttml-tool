import { Box, Dialog, Tabs } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { settingsDialogAtom, settingsTabAtom } from "$/states/dialogs.ts";
import { SettingsAboutTab } from "./about";
import { SettingsCommonTab } from "./common";
import { SettingsKeyBindingsDialog } from "./keybindings";
import { SettingsSpectrogramTab } from "./spectrogram";

export const SettingsDialog = memo(() => {
	const [settingsDialogOpen, setSettingsDialogOpen] =
		useAtom(settingsDialogAtom);
	const [activeTab, setActiveTab] = useAtom(settingsTabAtom);
	const { t } = useTranslation();

	return (
		<Dialog.Root open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
			<Dialog.Content maxWidth="600px">
				<Dialog.Title>{t("settingsDialog.title", "首选项")}</Dialog.Title>
				<Tabs.Root value={activeTab} onValueChange={setActiveTab}>
					<Tabs.List>
						<Tabs.Trigger value="common">
							{t("settingsDialog.tab.common", "常规")}
						</Tabs.Trigger>
						<Tabs.Trigger value="keybinding">
							{t("settingsDialog.tab.keybindings", "按键绑定")}
						</Tabs.Trigger>
						<Tabs.Trigger value="spectrogram">
							{t("settingsDialog.tab.spectrogram", "频谱图")}
						</Tabs.Trigger>
						<Tabs.Trigger value="about">
							{t("common.about", "关于")}
						</Tabs.Trigger>
					</Tabs.List>
					<Box
						style={{
							height: "630px",
							overflowY: "auto",
							padding: "var(--space-3)",
							paddingBottom: "var(--space-4)",
						}}
					>
						<Tabs.Content value="common">
							<SettingsCommonTab />
						</Tabs.Content>
						<Tabs.Content value="keybinding">
							<SettingsKeyBindingsDialog />
						</Tabs.Content>
						<Tabs.Content value="spectrogram">
							<SettingsSpectrogramTab />
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
