import { Button, Dialog, Flex } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { confirmDialogAtom } from "$/states/dialogs";

export const ConfirmationDialog = () => {
	const [dialogState, setDialogState] = useAtom(confirmDialogAtom);
	const { t } = useTranslation();

	const handleConfirm = () => {
		dialogState.onConfirm?.();
		setDialogState({ ...dialogState, open: false });
	};

	const handleCancel = () => {
		setDialogState({ ...dialogState, open: false });
	};

	return (
		<Dialog.Root open={dialogState.open} onOpenChange={handleCancel}>
			<Dialog.Content>
				<Dialog.Title>{dialogState.title}</Dialog.Title>
				<Dialog.Description>{dialogState.description}</Dialog.Description>
				<Flex gap="3" mt="4" justify="end">
					<Button variant="soft" color="gray" onClick={handleCancel}>
						{t("confirmDialog.cancel", "取消")}
					</Button>
					<Button onClick={handleConfirm}>
						{t("confirmDialog.confirm", "确认")}
					</Button>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};
