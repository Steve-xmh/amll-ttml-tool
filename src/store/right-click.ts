import { defineStore } from "pinia";

export const useRightClickLyricLine = defineStore("right-click-lyric-line", {
	state: () => ({
		show: false,
		selectedLine: 0,
		selectedWord: 0,
		x: 0,
		y: 0,
	}),
	actions: {
		showMenuForLyric(
			lineIndex: number,
			wordIndex: number,
			x: number,
			y: number,
		) {
			this.show = true;
			this.selectedLine = lineIndex;
			this.selectedWord = wordIndex;
			this.x = x;
			this.y = y;
		},
	},
});
