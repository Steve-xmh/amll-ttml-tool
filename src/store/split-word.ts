import { defineStore } from "pinia";

export const useSplitWord = defineStore("split-word", {
	state: () => ({
		opened: false,
        lineIndex: -1,
		wordIndex: -1,
	}),
    actions: {
        open(lineIndex: number, wordIndex: number) {
            this.$patch({
                opened: true,
                lineIndex,
                wordIndex
            });
        },
        close() {
            this.opened = false;
        }
    }
});
