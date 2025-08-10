import { confirmDialogAtom } from "$/states/dialogs";
import { Button, Dialog, Flex } from "@radix-ui/themes";
import { useAtom } from "jotai";

export const ConfirmationDialog = () => {
	const [dialogState, setDialogState] = useAtom(confirmDialogAtom);

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
						取消
					</Button>
					<Button onClick={handleConfirm}>确认</Button>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};
