/*
 * Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

// 修改自 https://github.com/wobsoriano/pinia-undo
// 因为目前那个 pinia-undo 那个库对深拷贝操作会发生异常
// 所以自己修改了一个版本，使得可以手动记录快照，限制最高撤销次数，并正确撤销和重做

import structuredClone from "@ungap/structured-clone";
import type {PiniaPluginContext} from "pinia";
import {toRaw} from "vue";

interface Serializer {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	serialize: (value: any) => string
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	deserialize: (value: string) => any
}

type Store = PiniaPluginContext["store"];
type Options = PiniaPluginContext["options"];

class UndoStack<T> {
	private stack: T[] = [];
	private stackPos = 0;

	constructor(
		firstValue: T,
		private limit = 50,
	) {
		this.stack.push(firstValue);
	}
	push(value: T) {
		this.stack.splice(++this.stackPos, 0, value);
		if (this.stackPos >= this.limit) this.stack.shift();
	}
	undo() {
		this.stackPos = Math.max(0, this.stackPos - 1);
		return this.stack[this.stackPos];
	}
	redo() {
		this.stackPos = Math.min(this.stack.length - 1, this.stackPos + 1);
		return this.stack[this.stackPos];
	}
}

/**
 * Removes properties from the store state.
 * @param options The options object defining the store passed to `defineStore()`.
 * @param store The store the plugin is augmenting.
 * @returns {object} State of the store without omitted keys.
 */
function removeOmittedKeys(
	options: Options,
	store: Store,
): Store['$state'] {
	const clone = (window.structuredClone || structuredClone)(toRaw(store.$state));
	if (options.undo?.omit) {
		for (const key of options.undo.omit) {
			delete clone[key];
		}
		return clone
	}
	return clone
}

type PluginOptions = PiniaPluginContext & {
	/**
	 * Custome serializer to serialize state before storing it in the undo stack.
	 */
	serializer?: Serializer
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
export function PiniaUndo({store, options}: PluginOptions) {
	if (!(options.undo?.enable))
		return
	const stack = new UndoStack(removeOmittedKeys(options, store));
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
		 *
		 * counterStore.$reset();
		 * counterStore.resetStack();
		 * ```
		 */
		undo: () => void
		redo: () => void
		resetStack: () => void
		record: () => void
	}

	// biome-ignore lint/correctness/noUnusedVariables: <explanation>
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
			enable?: boolean
			omit?: Array<keyof S>
		}
	}
}
