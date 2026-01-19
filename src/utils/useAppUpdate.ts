import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { useAtom, useStore } from "jotai";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	updateErrorAtom,
	updateInfoAtom,
	updateProgressAtom,
	updateStatusAtom,
} from "$/states/update";

export function useAppUpdate() {
	const [status, setStatus] = useAtom(updateStatusAtom);
	const [update, setUpdate] = useAtom(updateInfoAtom);
	const [progress, setProgress] = useAtom(updateProgressAtom);
	const [errorMsg, setErrorMsg] = useAtom(updateErrorAtom);
	const store = useStore();

	const { t } = useTranslation();

	const checkUpdate = useCallback(
		async (silent = false) => {
			const currentStatus = store.get(updateStatusAtom);
			if (currentStatus === "checking" || currentStatus === "downloading")
				return;

			setStatus("checking");
			setErrorMsg("");

			try {
				const updateResult = await check();
				if (updateResult) {
					setUpdate(updateResult);
					setStatus("available");
				} else {
					setUpdate(null);
					setStatus("up-to-date");
				}
			} catch (e) {
				if (!silent) {
					console.error("Failed to check for updates", e);
				}
				setStatus("error");
				setErrorMsg(String(e));
			}
		},
		[setStatus, setUpdate, setErrorMsg, store.get],
	);

	const installUpdate = useCallback(async () => {
		if (!update) return;

		setStatus("downloading");
		setProgress(0);

		let downloadedBytes = 0;
		let totalBytes = 0;

		try {
			await update.downloadAndInstall((event) => {
				switch (event.event) {
					case "Started":
						totalBytes = event.data.contentLength || 0;
						downloadedBytes = 0;
						setProgress(0);
						break;
					case "Progress":
						downloadedBytes += event.data.chunkLength;
						if (totalBytes > 0) {
							setProgress((downloadedBytes / totalBytes) * 100);
						}
						break;
					case "Finished":
						setProgress(100);
						break;
				}
			});

			setStatus("ready");

			try {
				await relaunch();
			} catch (e) {
				console.error("Auto relaunch failed", e);
			}
		} catch (e) {
			console.error("Failed to install update", e);
			setStatus("error");
			setErrorMsg(t("app.update.installError", "安装更新失败"));
		}
	}, [update, t, setStatus, setProgress, setErrorMsg]);

	return {
		status,
		update,
		progress,
		errorMsg,
		checkUpdate,
		installUpdate,
	};
}
