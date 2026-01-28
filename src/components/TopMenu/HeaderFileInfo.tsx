import {
	CloudCheckmarkRegular,
	CloudSyncRegular,
	HistoryRegular,
} from "@fluentui/react-icons";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
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
	const [isEditing, setIsEditing] = useState(false);
	const [draftName, setDraftName] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const suffix = ".ttml";

	const getBaseName = useCallback(
		(value: string) =>
			value.toLowerCase().endsWith(suffix)
				? value.slice(0, -suffix.length)
				: value,
		[suffix],
	);

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

	const finishEditing = useCallback(
		({ commit }: { commit: boolean }) => {
			if (commit) {
				const trimmed = draftName.trim();
				if (trimmed.length > 0) {
					setFilename(`${trimmed}${suffix}`);
				} else {
					setDraftName(getBaseName(filename));
				}
			}
			setIsEditing(false);
		},
		[draftName, filename, getBaseName, setFilename, suffix],
	);

	useEffect(() => {
		if (!isEditing) return;
		setDraftName(getBaseName(filename));
		inputRef.current?.focus();
		inputRef.current?.select();
	}, [filename, getBaseName, isEditing]);

	return (
		<Flex align="center" gap="2" style={{ maxWidth: "100%" }}>
			<Button
				variant="soft"
				onClick={() => setHistoryDialogOpen(true)}
				style={{ justifyContent: "start" }}
			>
				<HistoryRegular />
				{t("header.popover.versionHistory", "版本历史记录...")}
			</Button>

			<Box>
				{isEditing ? (
					<Flex align="center" gap="1">
						<TextField.Root
							ref={inputRef}
							size="1"
							value={draftName}
							onChange={(e) => setDraftName(e.target.value)}
							placeholder="example"
							style={{ width: "10rem" }}
							onBlur={() => finishEditing({ commit: true })}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									finishEditing({ commit: true });
								}
								if (event.key === "Escape") {
									finishEditing({ commit: false });
								}
							}}
						/>
						<Text size="2">{suffix}</Text>
					</Flex>
				) : (
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
						onClick={() => setIsEditing(true)}
					>
						<Flex align="center" gap="2" style={{ maxWidth: "100%" }}>
							<Flex
								align="center"
								style={{
									maxWidth: "10rem",
									overflow: "hidden",
									whiteSpace: "nowrap",
								}}
							>
								<Text
									weight="bold"
									size="2"
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									{getBaseName(filename)}
								</Text>
								<Text size="2">{suffix}</Text>
							</Flex>

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
						</Flex>
					</Button>
				)}
			</Box>
		</Flex>
	);
};
