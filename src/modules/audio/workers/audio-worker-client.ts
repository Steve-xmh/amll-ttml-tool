import type { AudioTaskType } from "../states";
import AudioWorker from "./audio.worker.ts?worker";
import type {
	WorkerRequest,
	WorkerRequestPayload,
	WorkerRequestType,
	WorkerResponse,
	WorkerResponseMap,
} from "./types";

type WorkerResponseValue = WorkerResponseMap[keyof WorkerResponseMap];

export interface WorkerUIHandlers {
	onTaskStart: (type: AudioTaskType) => void;
	onTaskEnd: () => void;
	onError: (error: string) => void;
	onTaskProgress: (progress: number) => void;
}

export class AudioWorkerClient {
	private worker: Worker;

	private pendingRequests = new Map<
		number,
		{
			resolve: (value: WorkerResponseValue) => void;
			reject: (reason?: Error) => void;
		}
	>();

	private messageIdCounter = 0;
	private uiHandlers: WorkerUIHandlers;

	constructor(uiHandlers: WorkerUIHandlers) {
		this.uiHandlers = uiHandlers;
		this.worker = new AudioWorker();

		this.worker.onmessage = this.handleMessage.bind(this);
		this.worker.onerror = (e) => {
			console.error("[Worker Error]", e);
			this.uiHandlers.onError("An error occurred");
		};
	}

	private handleMessage(e: MessageEvent<WorkerResponse>) {
		const msg = e.data;
		if (msg.type === "CHUNK") return;

		if ("id" in msg) {
			const pending = this.pendingRequests.get(msg.id);

			if (pending) {
				let isFinished = false;

				if (msg.type === "ERROR") {
					pending.reject(new Error(msg.error));
					isFinished = true;
				} else if (msg.type === "METADATA") {
					pending.resolve(msg);
					isFinished = true;
				} else if (msg.type === "SEEK_DONE") {
					pending.resolve(msg.time);
					isFinished = true;
				} else if (msg.type === "EXPORT_WAV_DONE") {
					pending.resolve(msg.blob);
					isFinished = true;
				} else if (msg.type === "ACK") {
					pending.resolve(undefined);
					isFinished = true;
				} else if (msg.type === "EOF") {
					// 暂不处理
				} else if (msg.type === "EXPORT_WAV_PROGRESS") {
					this.uiHandlers.onTaskProgress(msg.progress);
				}

				if (isFinished) {
					this.pendingRequests.delete(msg.id);
				}
			}
		}
	}

	private postRequest<T extends WorkerRequestType>(
		type: T,
		payload: WorkerRequestPayload<T>,
		transfer: Transferable[] = [],
	): Promise<WorkerResponseMap[T]> {
		const id = this.messageIdCounter++;

		return new Promise((resolve, reject) => {
			this.pendingRequests.set(id, {
				resolve: resolve as (value: WorkerResponseValue) => void,
				reject,
			});

			const req = { type, id, ...payload } as WorkerRequest;

			this.worker.postMessage(req, transfer);
		});
	}

	public async transcodeToWav(file: File | Blob): Promise<Blob> {
		const fileObj =
			file instanceof File
				? file
				: new File([file], "temp.bin", { type: file.type });

		this.uiHandlers.onTaskStart("TRANSCODING");

		try {
			const blob = await this.postRequest("EXPORT_WAV", { file: fileObj });
			this.uiHandlers.onTaskEnd();
			return blob;
		} catch (error) {
			this.uiHandlers.onError(
				`Transcoding failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			this.uiHandlers.onTaskEnd();
			throw error;
		}
	}

	public terminate() {
		this.worker.terminate();
		for (const [_, pending] of this.pendingRequests) {
			pending.reject(new Error("Worker terminated"));
		}
		this.pendingRequests.clear();
	}
}
