import { defineStore } from "pinia";

export const useSettings = defineStore("settings", {
	state: () => ({
		showTranslateLine: false,
		showRomanLine: false,
		volume: 0.5,
		speed: 1,
		
		showingTutorial: true,
	}),
	persist: true,
});
