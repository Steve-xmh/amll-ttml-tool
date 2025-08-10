import { atom } from "jotai";

export const importFromTextDialogAtom = atom(false);
export const metadataEditorDialogAtom = atom(false);
export const settingsDialogAtom = atom(false);
export const latencyTestDialogAtom = atom(false);
export const submitToAMLLDBDialogAtom = atom(false);
export const splitWordDialogAtom = atom(false);

export const confirmDialogAtom = atom<{
	open: boolean;
	title: string;
	description: string;
	onConfirm?: () => void;
}>({
	open: false,
	title: "",
	description: "",
});

export const historyRestoreDialogAtom = atom(false);