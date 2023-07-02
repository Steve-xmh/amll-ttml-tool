export function classname(
	...classes: (string | { [className: string]: boolean })[]
): string {
	let result: string[] = [];
	for (const arg of classes) {
		if (typeof arg === "string") {
			const className = arg.trim();
			if (!result.includes(className)) result.push(className);
		} else {
			for (const key in arg) {
				if (arg[key]) {
					const className = key.trim();
					if (!result.includes(className)) result.push(className);
				}
			}
		}
	}
	return result.join(" ");
}

export const waitNextTick = () =>
	new Promise((resolve) => requestAnimationFrame(resolve));
