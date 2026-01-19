import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const getGitCommitCount = () => {
	try {
		const count = execSync("git rev-list --count HEAD").toString().trim();
		return parseInt(count, 10);
	} catch (e) {
		console.warn("无法获取 Git 提交次数", e);
		return 0;
	}
};

const tauriConfigPath = join(process.cwd(), "src-tauri", "tauri.conf.json");

try {
	const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, "utf-8"));
	const currentVersion = tauriConfig.version;

	const [major, minor] = currentVersion.split(".");

	const commitCount = getGitCommitCount();
	const newVersion = `${major}.${minor}.${commitCount}`;

	console.log(`正在更新版本号: ${currentVersion} -> ${newVersion}`);

	tauriConfig.version = newVersion;
	writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 4)}\n`);
} catch (e) {
	console.error("更新版本号失败", e);
	process.exit(1);
}
