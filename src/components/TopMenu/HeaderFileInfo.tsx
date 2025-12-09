import {
	ChevronDown16Regular,
	CloudCheckmarkRegular,
	CloudSyncRegular,
	HistoryRegular,
} from "@fluentui/react-icons";
import { Box, Button, Flex, Popover, Text, TextField } from "@radix-ui/themes";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { historyRestoreDialogAtom } from "$/states/dialogs";
import {
	lastSavedTimeAtom,
	SaveStatus,
	saveFileNameAtom,
	saveStatusAtom,
} from "$/states/main";

export const HeaderFileInfo = () => {
	const { t } = useTranslation();
	const [filename, setFilename] = useAtom(saveFileNameAtom);
	const saveStatus = useAtomValue(saveStatusAtom);
	const lastSavedTime = useAtomValue(lastSavedTimeAtom);
	const setHistoryDialogOpen = useSetAtom(historyRestoreDialogAtom);
	const [open, setOpen] = useState(false);

	const getStatusDisplay = () => {
		switch (saveStatus) {
			case SaveStatus.Saving:
				return {
					text: t("header.status.saving", "正在保存..."),
					icon: <CloudSyncRegular />,
					color: "var(--accent-9)",
				};
			case SaveStatus.Pending:
				return {
					text: t("header.status.pending", "正在保存..."),
					icon: <CloudSyncRegular />,
					color: "var(--gray-10)",
				};
			default:
				if (lastSavedTime) {
					return {
						text: `${t("header.status.savedAt", "已保存")} ${new Date(
							lastSavedTime,
						).toLocaleTimeString()}`,
						icon: <CloudCheckmarkRegular />,
						color: "var(--gray-10)",
					};
				}
				return {
					text: t("header.status.saved", "已保存"),
					icon: <CloudCheckmarkRegular />,
					color: "var(--gray-10)",
				};
		}
	};

	const status = getStatusDisplay();

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger>
				<Button
					variant="ghost"
					color="gray"
					style={{
						height: "auto",
						padding: "6px 10px",
						fontWeight: "normal",
						color: "var(--gray-12)",
						maxWidth: "100%",
					}}
				>
					<Flex align="center" gap="2" style={{ maxWidth: "100%" }}>
						<Text
							weight="bold"
							size="2"
							style={{
								maxWidth: "10rem",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{filename}
						</Text>

						<Box
							style={{
								width: 4,
								height: 4,
								borderRadius: "50%",
								backgroundColor: "var(--gray-8)",
								flexShrink: 0,
							}}
						/>

						<Flex
							align="center"
							gap="1"
							style={{
								color: status.color,
								opacity: 0.8,
								transition: "color 0.2s",
								flexShrink: 0,
							}}
						>
							<Text size="1" style={{ display: "flex" }}>
								{status.icon}
							</Text>
							<Text size="1">{status.text}</Text>
						</Flex>

						<ChevronDown16Regular
							fontSize={10}
							style={{ opacity: 0.4, marginLeft: 4, flexShrink: 0 }}
						/>
					</Flex>
				</Button>
			</Popover.Trigger>
			<Popover.Content style={{ width: 320 }}>
				<Flex direction="column" gap="3">
					<Box>
						<Text size="2" weight="bold" as="div" mb="1">
							{t("header.popover.filename", "文件名")}
						</Text>
						<TextField.Root
							value={filename}
							onChange={(e) => setFilename(e.target.value)}
							placeholder="example.ttml"
						/>
					</Box>

					<Box>
						<Button
							variant="soft"
							style={{ width: "100%", justifyContent: "start" }}
							onClick={() => {
								setOpen(false);
								setHistoryDialogOpen(true);
							}}
						>
							<HistoryRegular />
							{t("header.popover.versionHistory", "版本历史记录...")}
						</Button>
					</Box>
				</Flex>
			</Popover.Content>
		</Popover.Root>
	);
};
