import { defineStore } from "pinia";

interface ProgressState {
	label: string;
	progress: number;
	parent?: ProgressState;
}

export const useProgress = defineStore("progress", {
	state: () => ({
		currentProgresses: [] as ProgressState[],
	}),
	actions: {
		newProgress(label: string) {
			this.currentProgresses.push({
				label,
				progress: 0,
				parent: undefined,
			});
			return this.currentProgresses[this.currentProgresses.length - 1];
		},
		finishProgress(progress: ProgressState) {
			this.currentProgresses.splice(
				this.currentProgresses.indexOf(progress),
				1,
			);
		},
	},
});
