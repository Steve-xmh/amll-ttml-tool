import { defineStore } from "pinia";

export const useDialogs = defineStore("dialogs", {
	state: () => ({
        submitLyric: false
	}),
});
