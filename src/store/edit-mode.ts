import { defineStore } from "pinia";

export interface EditModeStore {
	editMode: "edit" | "sync";
}

export const useEditMode = defineStore("current-sync-word", {
	state: () =>
		({
			editMode: "edit",
		}) as EditModeStore,
});
