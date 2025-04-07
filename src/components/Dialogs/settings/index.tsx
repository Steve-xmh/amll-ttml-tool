
import { settingsDialogAtom } from "$/states/dialogs.ts";
import { Dialog } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { memo } from "react";

export const SettingsDialog = memo(() => {
    const [settingsDialogOpen, setSettingsDialogOpen] =
        useAtom(settingsDialogAtom);

    return (
        <Dialog.Root open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
            <Dialog.Content>
                <Dialog.Title>首选项</Dialog.Title>
                施工中，敬请期待
            </Dialog.Content>
        </Dialog.Root>
    );
});
