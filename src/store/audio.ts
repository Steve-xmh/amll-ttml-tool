import { defineStore } from "pinia";

export const useAudio = defineStore("audio", {
	state: () => ({
		playing: false,
		canPlay: false,
		audioURL: "",
		currentTime: 0,
		duration: 0,
	}),
	actions: {
		setCurrentTime(currentTime: number) {
			this.currentTime = currentTime;
		}
	}
});
