import { watch } from "vue";

export type KeyBindingsConfig = string[];
export interface KeyBindingEvent {
	downTime: number;
	downTimeOffset: number;
}
export type KeyBindingCallback = (evt: KeyBindingEvent) => void;

export function formatKeyBindings(cfg: KeyBindingsConfig): string {
	return cfg.join(" + ");
}

const bufferedKeys = new Set<string>();
const pressingKeys = new Set<string>();
const registeredKeyBindings = new Map<string, Set<KeyBindingCallback>>();
let downTime = 0;
window.addEventListener("keydown", (evt) => {
	console.log("Key down", evt.code);
	if (isEditing(evt)) {
		pressingKeys.clear();
		bufferedKeys.clear();
		return;
	}
	if (pressingKeys.size === 0) {
		downTime = evt.timeStamp;
	}
	pressingKeys.add(evt.code);
	bufferedKeys.add(evt.code);
});
window.addEventListener("keyup", (evt) => {
	if (isEditing(evt)) {
		pressingKeys.clear();
		bufferedKeys.clear();
		return;
	}
	console.log(pressingKeys.size);
	if (bufferedKeys.size > 0) {
		const joined = [...bufferedKeys].join(" + ");
		bufferedKeys.clear();
		const callbacks = registeredKeyBindings.get(joined);

		if (callbacks) {
			const downTimeOffset = evt.timeStamp - downTime;
			const e: KeyBindingEvent = {
				downTime,
				downTimeOffset,
			};
			for (const cb of callbacks) {
				try {
					cb(e);
				} catch (err) {
					console.warn("Error in key binding ", joined, "callback", err);
				}
			}
			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();
		}
	}
	pressingKeys.clear();
});

// From https://wangchujiang.com/hotkeys-js/
function isEditing(event: KeyboardEvent) {
	const target = (event.target || event.srcElement) as HTMLElement | null;
	const tagName = target?.tagName;
	return (
		target?.isContentEditable ||
		tagName === "INPUT" ||
		tagName === "SELECT" ||
		tagName === "TEXTAREA" ||
		!!currentKeyDownEvent ||
		!!currentKeyUpEvent
	);
}

export function registerKeyBindings(
	cfg: KeyBindingsConfig,
	callback: KeyBindingCallback,
) {
	if (cfg.length === 0) {
		return () => {};
	}
	const joined = [...cfg].join(" + ");
	let set = registeredKeyBindings.get(joined);
	if (!set) {
		set = new Set();
		registeredKeyBindings.set(joined, set);
	}
	console.log("Registering", joined);
	set.add(callback);
	return () => {
		set?.delete(callback);
	};
}

export function useKeyBinding(
	cfg: KeyBindingsConfig,
	callback: KeyBindingCallback,
) {
	watch(
		() => cfg,
		(n, _old, onCleanup) => {
			onCleanup(registerKeyBindings(n, callback));
		},
		{
			immediate: true,
		},
	);
}

let currentKeyDownEvent: ((evt: KeyboardEvent) => void) | undefined = undefined;
let currentKeyUpEvent: ((evt: KeyboardEvent) => void) | undefined = undefined;

export function stopRecordingShortcut() {
	if (currentKeyDownEvent) {
		window.removeEventListener("keydown", currentKeyDownEvent);
		currentKeyDownEvent = undefined;
	}
	if (currentKeyUpEvent) {
		window.removeEventListener("keyup", currentKeyUpEvent);
		currentKeyUpEvent = undefined;
	}
}

export function recordShortcut(): Promise<KeyBindingsConfig> {
	return new Promise((resolve, reject) => {
		stopRecordingShortcut();
		const recorded = new Set<string>();
		const stack = new Set<string>();
		const onKeyDown = (evt: KeyboardEvent) => {
			recorded.add(evt.code);
			stack.add(evt.code);
			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();
		};
		const onKeyUp = (evt: KeyboardEvent) => {
			stack.delete(evt.code);
			if (stack.size === 0) {
				stopRecordingShortcut();
				if (stack.has("Escape")) {
					reject(new Error("User canceled"));
				} else {
					resolve([...recorded]);
				}
			}
			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();
		};
		currentKeyDownEvent = onKeyDown;
		currentKeyUpEvent = onKeyUp;
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	});
}
