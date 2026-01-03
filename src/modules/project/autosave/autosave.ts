import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { identifyProject } from "$/modules/project/logic/project-info";
import type { TTMLLyric } from "$/types/ttml";

const DB_NAME = "amll-autosave-db";
const DB_VERSION = 2;

/**
 * @description 旧版快照结构，仅用于数据迁移
 * @internal
 */
interface LegacySnapshot {
	id?: number;
	timestamp: number;
	lyrics: TTMLLyric;
}

/**
 * @description 项目基本信息，用于快速恢复最新版本
 */
export interface ProjectInfo {
	/**
	 * @description 项目唯一标识符
	 */
	id: string;
	/**
	 * @description 项目显示名称，通常由 `identifyProject` 生成
	 */
	name: string;
	/**
	 * @description 最后修改时间戳
	 */
	lastModified: number;
	/**
	 * @description 歌词预览文本
	 */
	preview?: string;
	/**
	 * @description 项目的最新版本
	 */
	latestState: TTMLLyric;
}

/**
 * @description 项目的历史版本
 */
export interface ProjectVersion {
	/**
	 * @description 自增主键 ID
	 */
	id?: number;
	/**
	 * @description 关联的项目 ID (外键)
	 *
	 */
	projectId: string;
	/**
	 * @description 保存时的时间戳
	 */
	timestamp: number;
	/**
	 * @description 该版本的歌词数据
	 */
	data: TTMLLyric;
}

/**
 * @description 数据库 Schema 定义
 */
interface AutosaveDBSchema extends DBSchema {
	/**
	 * @description 用来存储每个项目的元信息 (元数据只存最新的) 和状态
	 */
	projects: {
		key: string;
		value: ProjectInfo;
		indexes: { "by-last-modified": number };
	};
	/**
	 * @description 用来存储所有项目的历史记录
	 */
	versions: {
		key: number;
		value: ProjectVersion;
		indexes: {
			/**
			 * @description 用于查找某项目的所有版本
			 */
			"by-project": string;
			/**
			 * @description 用于查找某项目最新版本
			 */
			"by-project-date": [string, number];
		};
	};
}

let dbPromise: Promise<IDBPDatabase<AutosaveDBSchema>> | null = null;

/**
 * @description 获取数据库
 */
function getDB() {
	if (!dbPromise) {
		dbPromise = openDB<AutosaveDBSchema>(DB_NAME, DB_VERSION, {
			async upgrade(db, oldVersion, _newVersion, transaction) {
				if (!db.objectStoreNames.contains("projects")) {
					const projectStore = db.createObjectStore("projects", {
						keyPath: "id",
					});
					projectStore.createIndex("by-last-modified", "lastModified");
				}

				if (!db.objectStoreNames.contains("versions")) {
					const versionStore = db.createObjectStore("versions", {
						keyPath: "id",
						autoIncrement: true,
					});
					versionStore.createIndex("by-project", "projectId");
					versionStore.createIndex("by-project-date", [
						"projectId",
						"timestamp",
					]);
				}

				if (
					oldVersion < 2 &&
					// biome-ignore lint/suspicious/noExplicitAny: 旧版本的快照
					db.objectStoreNames.contains("snapshots" as any)
				) {
					const legacyProjectId = "legacy_autosave_archive";
					// biome-ignore lint/suspicious/noExplicitAny: 旧版本的快照，应该存在
					const oldStore = transaction.objectStore("snapshots" as any);
					const oldSnapshots = (await oldStore.getAll()) as LegacySnapshot[];

					if (oldSnapshots && oldSnapshots.length > 0) {
						oldSnapshots.sort((a, b) => a.timestamp - b.timestamp);
						const latestSnapshot = oldSnapshots[oldSnapshots.length - 1];
						const projectStore = transaction.objectStore("projects");
						await projectStore.put({
							id: legacyProjectId,
							name: "Legacy Snapshots Archive",
							lastModified: latestSnapshot.timestamp,
							latestState: latestSnapshot.lyrics,
							preview: "(来自旧版自动保存的历史数据)",
						});
						const versionStore = transaction.objectStore("versions");
						for (const snap of oldSnapshots) {
							await versionStore.add({
								projectId: legacyProjectId,
								timestamp: snap.timestamp,
								data: snap.lyrics,
							});
						}
					}
					// biome-ignore lint/suspicious/noExplicitAny: 旧版本的快照，应该存在
					db.deleteObjectStore("snapshots" as any);
				}
			},
		});
	}
	return dbPromise;
}

/**
 * @description 执行自动保存操作
 * @param projectId 当前会话的项目 ID
 * @param lyrics 当前编辑器中的歌词数据
 * @param limit 每个项目保留的历史版本数量上限
 * @param saveInterval 创建历史版本的时间间隔阈值 (毫秒)
 */
export async function autoSaveProject(
	projectId: string,
	lyrics: TTMLLyric,
	limit: number,
	saveInterval: number,
) {
	const db = await getDB();

	const identity = identifyProject(lyrics);
	const now = Date.now();

	const tx = db.transaction(["projects", "versions"], "readwrite");
	const projectStore = tx.objectStore("projects");
	const versionStore = tx.objectStore("versions");

	await projectStore.put({
		id: projectId,
		name: identity.displayName,
		lastModified: now,
		latestState: lyrics,
		preview: lyrics.lyricLines[0]?.words.map((w) => w.word).join("") || "",
	});

	let lastVersionTime = 0;
	const index = versionStore.index("by-project-date");
	const range = IDBKeyRange.bound([projectId, 0], [projectId, Infinity]);
	const cursor = await index.openCursor(range, "prev");

	if (cursor) {
		lastVersionTime = cursor.value.timestamp;
	}

	if (now - lastVersionTime > saveInterval) {
		await versionStore.add({
			projectId: projectId,
			timestamp: now,
			data: lyrics,
		});

		const allVersionKeys = await index.getAllKeys(range);
		if (allVersionKeys.length > limit) {
			const keysToDelete = allVersionKeys.slice(
				0,
				allVersionKeys.length - limit,
			);
			await Promise.all(keysToDelete.map((key) => versionStore.delete(key)));
		}
	}

	await tx.done;
}

/**
 * @description 获取所有项目列表
 * @returns 项目列表，最新的在前
 */
export async function getProjectList(): Promise<ProjectInfo[]> {
	const db = await getDB();
	const projects = await db.getAllFromIndex("projects", "by-last-modified");
	return projects.reverse();
}

/**
 * @description 获取指定项目的所有历史版本
 * @param projectId 项目 ID
 * @returns 历史版本列表，最新的在前
 */
export async function getProjectVersions(
	projectId: string,
): Promise<ProjectVersion[]> {
	const db = await getDB();
	const range = IDBKeyRange.bound([projectId, 0], [projectId, Infinity]);
	const versions = await db.getAllFromIndex(
		"versions",
		"by-project-date",
		range,
	);
	return versions.reverse();
}

/**
 * @description 获取指定项目的最新状态
 * @param projectId 要获取项目的 ID
 */
export async function getProjectLatestState(
	projectId: string,
): Promise<TTMLLyric | undefined> {
	const db = await getDB();
	const project = await db.get("projects", projectId);
	return project?.latestState;
}

/**
 * @description 删除项目及其所有的历史记录
 * @param projectId 要删除的项目 ID
 */
export async function deleteProject(projectId: string): Promise<void> {
	const db = await getDB();
	const tx = db.transaction(["projects", "versions"], "readwrite");
	await tx.objectStore("projects").delete(projectId);

	const versionStore = tx.objectStore("versions");
	const index = versionStore.index("by-project");
	const keys = await index.getAllKeys(projectId);

	await Promise.all(keys.map((k) => versionStore.delete(k)));

	await tx.done;
}
