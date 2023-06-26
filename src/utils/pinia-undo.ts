// 修改自 https://github.com/wobsoriano/pinia-undo
// 因为目前那个 pinia-undo 那个库对深拷贝操作会发生异常
// 所以自己修改了一个版本，使得可以手动记录快照，并正确撤销和重做

import type { PiniaPluginContext } from "pinia";
import structuredClone from "@ungap/structured-clone";
import createStack from "undo-stacker";
import { toRaw } from "vue";

type Store = PiniaPluginContext["store"];
type Options = PiniaPluginContext["options"];

/**
 * Removes properties from the store state.
 * @param options The options object defining the store passed to `defineStore()`.
 * @param store The store the plugin is augmenting.
 * @returns {Object} State of the store without omitted keys.
 */
function removeOmittedKeys(options: Options, store: Store): Store["$state"] {
	const clone = JSON.parse(JSON.stringify(toRaw(store.$state)));
	if (options.undo?.omit) {
		options.undo.omit.forEach((key) => {
			// rome-ignore lint/performance/noDelete: <explanation>
			delete clone[key];
		});
		return clone;
	}
	return clone;
}

/**
 * Adds Undo/Redo properties to your store.
 *
 * @example
 *
 * ```ts
 * import { PiniaUndo } from 'pinia-undo'
 *
 * // Pass the plugin to your application's pinia plugin
 * pinia.use(PiniaUndo)
 * ```
 */
export function PiniaUndo({ store, options }: PiniaPluginContext) {
	if (!options.undo?.enable) return;
	const stack = createStack(removeOmittedKeys(options, store));
	store.undo = () => {
		const undeStore = structuredClone(stack.undo()); // 如果不做深拷贝，深度对象会导致传入 Store 后被二次修改，导致异常
		store.$patch(undeStore);
	};
	store.redo = () => {
		const undeStore = structuredClone(stack.redo()); // 如果不做深拷贝，深度对象会导致传入 Store 后被二次修改，导致异常
		store.$patch(undeStore);
	};
	store.record = () => {
		const stackStore = removeOmittedKeys(options, store);
		stack.push(stackStore);
	};
}

declare module "pinia" {
	export interface PiniaCustomProperties {
		/**
		 * Undo/Redo a state.
		 *
		 * @example
		 *
		 * ```ts
		 * const counterStore = useCounterStore()
		 *
		 * counterStore.increment();
		 * counterStore.undo();
		 * counterStore.redo();
		 * ```
		 */
		undo: () => void;
		redo: () => void;
		record: () => void;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export interface DefineStoreOptionsBase<S, Store> {
		/**
		 * Disable or ignore specific fields.
		 *
		 * @example
		 *
		 * ```js
		 * defineStore({
		 *   id: 'counter',
		 *   state: () => ({ count: 0, foo: 'bar' })
		 *   undo: {
		 *     // An array of fields that the plugin will ignore.
		 *     omit: ['name'],
		 *     // Disable history tracking of this store.
		 *     disable: true
		 *   }
		 * })
		 * ```
		 */
		undo?: {
			enable?: boolean;
			omit?: Array<keyof S>;
		};
	}
}
