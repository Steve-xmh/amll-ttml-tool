/**
 * @description LRU 缓存
 */

export class LRUCache<K, V> {
	private maxSize: number;
	private map: Map<K, V>;
	private onEvict: ((key: K, value: V) => void) | null;

	constructor(
		maxSize: number,
		onEvict: ((key: K, value: V) => void) | null = null,
	) {
		this.maxSize = maxSize > 0 ? maxSize : 1;
		this.map = new Map<K, V>();
		this.onEvict = onEvict;
	}

	/**
	 * @description 获取一个条目
	 */
	get(key: K): V | undefined {
		const entry = this.map.get(key);
		if (entry) {
			this.map.delete(key);
			this.map.set(key, entry);
		}
		return entry;
	}

	/**
	 * @description 设置一个条目，如果已存在则替换，并尝试驱逐最久未使用的条目
	 */
	set(key: K, value: V) {
		if (this.map.has(key)) {
			const existingEntry = this.map.get(key);
			if (existingEntry) {
				this.onEvict?.(key, existingEntry);
			}
			this.map.delete(key);
		}

		this.map.set(key, value);

		if (this.map.size > this.maxSize) {
			this.evict();
		}
	}

	/**
	 * @description 驱逐最久未使用的条目
	 */
	private evict() {
		const lruKey = this.map.keys().next().value;
		if (lruKey) {
			const lruEntry = this.map.get(lruKey);
			if (lruEntry) {
				this.onEvict?.(lruKey, lruEntry);
			}
			this.map.delete(lruKey);
		}
	}

	/**
	 * @description 清空缓存
	 */
	clear() {
		if (this.onEvict) {
			for (const [key, entry] of this.map.entries()) {
				this.onEvict(key, entry);
			}
		}
		this.map.clear();
	}
}
