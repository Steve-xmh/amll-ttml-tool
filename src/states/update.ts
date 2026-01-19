import type { Update } from "@tauri-apps/plugin-updater";
import { atom } from "jotai";

export type UpdateStatus =
	| "idle"
	| "checking"
	| "up-to-date"
	| "available"
	| "downloading"
	| "ready"
	| "error";

export const updateStatusAtom = atom<UpdateStatus>("idle");
export const updateInfoAtom = atom<Update | null>(null);
export const updateProgressAtom = atom<number>(0);
export const updateErrorAtom = atom<string>("");
