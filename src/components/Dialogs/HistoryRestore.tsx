import { confirmDialogAtom, historyRestoreDialogAtom } from "$/states/dialogs";
import { lyricLinesAtom } from "$/states/main";
import { deleteSnapshot, getSnapshot, listSnapshots } from "$/utils/autosave";
import {
	Box,
	Button,
	Dialog,
	Flex,
	IconButton,
	ScrollArea,
	Table,
	Text,
} from "@radix-ui/themes";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { DeleteRegular } from "@fluentui/react-icons";

interface SnapshotItem {
	id: number;
	timestamp: number;
}

export const HistoryRestoreDialog = () => {
	const [isOpen, setIsOpen] = useAtom(historyRestoreDialogAtom);
	const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
	const setLyrics = useSetAtom(lyricLinesAtom);
	const setConfirmDialog = useSetAtom(confirmDialogAtom);
	const { t } = useTranslation();

	useEffect(() => {
		if (isOpen) {
			listSnapshots()
				.then((snaps) =>
					setSnapshots(
						snaps.map((s) => ({ id: s.id!, timestamp: s.timestamp })),
					),
				)
				.catch(console.error);
		}
	}, [isOpen]);

	const handleRestore = (snapshotId: number) => {
		setConfirmDialog({
			open: true,
			title: t("historyRestoreDialog.confirm.title"),
			description: t("historyRestoreDialog.confirm.description"),
			onConfirm: async () => {
				const snapshot = await getSnapshot(snapshotId);
				if (snapshot) {
					setLyrics(snapshot.lyrics);
					setIsOpen(false);
				}
			},
		});
	};

	const handleDelete = async (snapshotId: number) => {
		try {
			await deleteSnapshot(snapshotId);
			setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
		} catch (err) {
			console.error("Failed to delete snapshot", err);
			toast.error("删除快照失败");
		}
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Content>
				<Dialog.Title>{t("historyRestoreDialog.title")}</Dialog.Title>
				<Dialog.Description>
					{t("historyRestoreDialog.description")}
				</Dialog.Description>

				<Box mt="4" style={{ maxHeight: "50vh" }}>
					<ScrollArea
						type="auto"
						scrollbars="vertical"
						style={{ height: "100%" }}
					>
						<Table.Root variant="surface">
							<Table.Header>
								<Table.Row>
									<Table.ColumnHeaderCell>
										{t("historyRestoreDialog.tableHeader")}
									</Table.ColumnHeaderCell>
									<Table.ColumnHeaderCell />
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{snapshots.length > 0 ? (
									snapshots.map((snap) => (
										<Table.Row key={snap.id}>
											<Table.RowHeaderCell>
												{new Date(snap.timestamp).toLocaleString()}
											</Table.RowHeaderCell>
											<Table.Cell justify="end">
												<Flex gap="2" justify="end">
													<Button
														size="1"
														onClick={() => handleRestore(snap.id)}
													>
														{t("historyRestoreDialog.restoreButton")}
													</Button>
													<IconButton
														size="1"
														variant="soft"
														color="red"
														onClick={() => handleDelete(snap.id)}
													>
														<DeleteRegular />
													</IconButton>
												</Flex>
											</Table.Cell>
										</Table.Row>
									))
								) : (
									<Table.Row>
										<Table.Cell colSpan={2} align="center">
											<Text color="gray" size="2">
												{t("historyRestoreDialog.noHistory")}
											</Text>
										</Table.Cell>
									</Table.Row>
								)}
							</Table.Body>
						</Table.Root>
					</ScrollArea>
				</Box>

				<Flex gap="3" mt="4" justify="end">
					<Dialog.Close>
						<Button variant="soft" color="gray">
							{t("historyRestoreDialog.cancelButton")}
						</Button>
					</Dialog.Close>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};
