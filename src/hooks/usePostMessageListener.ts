import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { confirmDialogAtom } from "$/states/dialogs.ts";
import type {
	ToolPostMessage,
	ToolPostMessageProtocol,
} from "$/types/post-message-protocol.ts";
import { audioEngine } from "$/utils/audio";
import { log, error as logError } from "$/utils/logging.ts";
import { useFileOpener } from "./useFileOpener.ts";

function isToolPostMessage(data: unknown): data is ToolPostMessage {
	return (
		typeof data === "object" &&
		data !== null &&
		"type" in data &&
		data.type === "OPEN_PROJECT" &&
		"payload" in data &&
		typeof data.payload === "object" &&
		data.payload !== null
	);
}

export const usePostMessageListener = () => {
	const setConfirmDialog = useSetAtom(confirmDialogAtom);
	const { t } = useTranslation();
	const { openFile } = useFileOpener();

	useEffect(() => {
		const handleMessage = async (event: MessageEvent) => {
			// 不验证 origin，因为我们要接收所有网站的请求
			const data = event.data;

			if (!isToolPostMessage(data)) {
				return;
			}

			const { audio, lyrics } = data.payload;

			const sourceWindow = event.source as WindowProxy | null;
			const sourceOrigin = event.origin;

			const reply = (message: ToolPostMessageProtocol) => {
				if (sourceWindow?.postMessage) {
					sourceWindow.postMessage(message, sourceOrigin);
				}
			};

			log("Received OPEN_PROJECT message", data);

			setConfirmDialog({
				open: true,
				title: t("confirmDialog.postMessage.title", "收到打开项目请求"),
				description: t(
					"confirmDialog.postMessage.description",
					"{origin} 正在请求打开一个项目，如果继续，当前未保存的更改将会丢失。确定要加载吗？",
					{ origin: sourceOrigin },
				),
				onCancel: () => {
					reply({ type: "LOAD_CANCELLED" });
				},
				onConfirm: async () => {
					try {
						if (audio) {
							if (audio.blob) {
								await audioEngine.loadMusic(audio.blob);
							} else if (audio.url) {
								try {
									const response = await fetch(audio.url);
									if (!response.ok) {
										throw new Error(`HTTP error! status: ${response.status}`);
									}
									const blob = await response.blob();
									await audioEngine.loadMusic(blob);
								} catch (e) {
									logError("Failed to fetch audio from URL", e);
									toast.error(
										t(
											"error.postMessageAudioFetchFailed",
											"无法从 URL 加载音频",
										),
									);
								}
							}
						}

						if (lyrics?.content) {
							const format = lyrics.format || "ttml";
							const fileName = audio?.metadata?.title
								? `${audio.metadata.title}`
								: "imported";
							const file = new File([lyrics.content], `${fileName}.${format}`, {
								type: "text/plain",
							});
							openFile(file, format, /* skipConfirm */ true);
						}
						reply({ type: "LOAD_SUCCESS" });
					} catch (e) {
						logError("Failed to handle postMessage payload", e);
						toast.error(
							t("error.postMessageLoadFailed", "加载来自外部的项目失败"),
						);
						reply({
							type: "LOAD_ERROR",
							payload: {
								message: e instanceof Error ? e.message : "Unknown error",
							},
						});
					}
				},
			});
		};

		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, [setConfirmDialog, t, openFile]);

	useEffect(() => {
		const readyMessage: ToolPostMessageProtocol = {
			type: "TOOL_READY",
		};

		if (window.opener) {
			window.opener.postMessage(readyMessage, "*");
		} else if (window.parent && window.parent !== window) {
			window.parent.postMessage(readyMessage, "*");
		}
	}, []);
};
