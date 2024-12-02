import {Dialog} from "@radix-ui/themes";
import {importFromTextDialogAtom} from "$/states/dialogs.ts";
import {useAtom} from "jotai";

export const ImportFromText = () => {
	const [importFromTextDialog, setImportFromTextDialog] = useAtom(
		importFromTextDialogAtom,
	);
	return (
		<Dialog.Root
			open={importFromTextDialog}
			onOpenChange={setImportFromTextDialog}
		>
			<Dialog.Content>
				<Dialog.Title>导入纯文本歌词</Dialog.Title>
				施工中，敬请期待
			</Dialog.Content>
		</Dialog.Root>
	);
};
