import type { TTMLLyric } from "$/utils/ttml-types";
import { type DBSchema, type IDBPDatabase, openDB } from "idb";

const DB_NAME = "amll-autosave-db";
const STORE_NAME = "snapshots";
const DB_VERSION = 1;

interface Snapshot {
	id?: number;
	timestamp: number;
	lyrics: TTMLLyric;
}

interface AutosaveDBSchema extends DBSchema {
	[STORE_NAME]: {
		key: number;
		value: Snapshot;
		indexes: { "by-timestamp": number };
	};
}

let dbPromise: Promise<IDBPDatabase<AutosaveDBSchema>> | null = null;

function getDB() {
	if (!dbPromise) {
		dbPromise = openDB<AutosaveDBSchema>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				const store = db.createObjectStore(STORE_NAME, {
					keyPath: "id",
					autoIncrement: true,
				});
				store.createIndex("by-timestamp", "timestamp");
			},
		});
	}
	return dbPromise;
}

export async function addSnapshot(lyrics: TTMLLyric, limit: number) {
	const db = await getDB();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);

	const snapshot: Omit<Snapshot, "id"> = {
		lyrics,
		timestamp: Date.now(),
	};
	await store.add(snapshot);

	const keys = await store.index("by-timestamp").getAllKeys();
	if (keys.length > limit) {
		const keysToDelete = keys.slice(0, keys.length - limit);
		await Promise.all(keysToDelete.map((key) => store.delete(key)));
	}

	await tx.done;
}

export async function listSnapshots(): Promise<Snapshot[]> {
	const db = await getDB();
	const snapshots = await db.getAllFromIndex(STORE_NAME, "by-timestamp");
	return snapshots.reverse();
}

export async function getSnapshot(id: number): Promise<Snapshot | undefined> {
	const db = await getDB();
	return db.get(STORE_NAME, id);
}

export async function deleteSnapshot(id: number): Promise<void> {
	const db = await getDB();
	await db.delete(STORE_NAME, id);
}
