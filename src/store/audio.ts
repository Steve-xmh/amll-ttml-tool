import { defineStore } from "pinia";

export const useAudio = defineStore("audio", {
	state: () => ({
		playing: false,
		canPlay: false,
		audioURL: "",
		currentTime: 0,
		duration: 0,
	}),
	getters: {
		currentTimeMS: (state) => {
			return Math.floor(state.currentTime);
		},
	},
	actions: {
		setCurrentTime(currentTime: number) {
			this.currentTime = currentTime;
		},
	},
});
