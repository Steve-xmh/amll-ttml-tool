import { defineStore } from "pinia";

export const useCurrentSyncWord = defineStore("current-sync-word", {
	state: () => ({
		lineIndex: -1,
		wordIndex: -1,
	}),
});
