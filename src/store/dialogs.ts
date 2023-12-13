import { defineStore } from "pinia";

export const useDialogs = defineStore("dialogs", {
	state: () => ({
		importFromDB: false,
		submitLyric: false,
		editLyricInfo: false,
		importFromText: false,
	}),
});
