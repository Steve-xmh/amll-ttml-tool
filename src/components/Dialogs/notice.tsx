import { Button, Dialog } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const noticeLevelDialogAtom = atomWithStorage("noticeLevelDialog", 1);
const CURRENT_NOTICE_LEVEL = 1;

export const NoticeDialog = () => {
	const [noticeLevelDialog, setNoticeLevelDialog] = useAtom(
		noticeLevelDialogAtom,
	);

	return (
		<Dialog.Root open={noticeLevelDialog < CURRENT_NOTICE_LEVEL}>
			<Dialog.Content>
				<Dialog.Title>暂无通知</Dialog.Title>
				<Dialog.Description>吧</Dialog.Description>
				<Dialog.Close>
					<Button
						mt="4"
						onClick={() => {
							setNoticeLevelDialog(CURRENT_NOTICE_LEVEL);
						}}
					>
						关闭
					</Button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Root>
	);
};
