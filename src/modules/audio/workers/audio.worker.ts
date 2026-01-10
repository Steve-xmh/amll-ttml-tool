import createAudioDecoderCore from "../assets/decode-audio.js";
import type {
	AudioDecoderModule,
	AudioStreamDecoder,
	WorkerRequest,
	WorkerResponse,
} from "./types";

let ffmpegModulePromise: Promise<AudioDecoderModule> | null = null;

function getModule(): Promise<AudioDecoderModule> {
	if (!ffmpegModulePromise) {
		ffmpegModulePromise = createAudioDecoderCore({
			locateFile: (path: string) =>
				path.endsWith(".wasm") ? "/decode-audio.wasm" : path,
			print: (text: string) => console.log("[WASM]", text),
			printErr: (text: string) => console.error("[WASM Error]", text),
		}) as Promise<AudioDecoderModule>;
	}
	return ffmpegModulePromise;
}

class DecoderSession {
	private decoder: AudioStreamDecoder | null = null;
	private mountDir: string;
	/**
	 * 是否活着，用于退出循环
	 */
	private isRunning = true;
	/**
	 * 是否暂停，用于暂时挂起
	 */
	private isPaused = false;

	constructor(
		private module: AudioDecoderModule,
		public req: WorkerRequest & { type: "INIT" },
	) {
		this.mountDir = `/session_${req.id}`;
		this.init();
	}

	private init() {
		try {
			this.module.FS.mkdir(this.mountDir);
			this.module.FS.mount(
				this.module.FS.filesystems.WORKERFS,
				{ files: [this.req.file] },
				this.mountDir,
			);
		} catch (e) {
			console.warn(`[DecoderSession] Mount error: ${e}`);
		}

		const filePath = `${this.mountDir}/${this.req.file.name}`;
		this.decoder = new this.module.AudioStreamDecoder();
		const props = this.decoder.init(filePath);

		if (props.status.status < 0) {
			throw new Error(`Decoder init failed: ${props.status.error}`);
		}

		const metadataObj: Record<string, string> = {};

		const keysList = props.metadata.keys();

		for (let i = 0; i < keysList.size(); i++) {
			const key = keysList.get(i);
			metadataObj[key] = props.metadata.get(key);
		}

		keysList.delete();

		let coverUrl: string | undefined;
		if (props.coverArt.size() > 0) {
			const cover = new Uint8Array(props.coverArt.size());
			for (let i = 0; i < props.coverArt.size(); i++) {
				cover[i] = props.coverArt.get(i);
			}
			coverUrl = URL.createObjectURL(new Blob([cover]));
		}

		this.post({
			type: "METADATA",
			id: this.req.id,
			sampleRate: props.sampleRate,
			channels: props.channelCount,
			duration: props.duration,
			metadata: metadataObj,
			encoding: props.encoding,
			coverUrl,
			bitsPerSample: props.bitsPerSample,
		});

		props.metadata?.delete();
		props.coverArt?.delete();

		this.decodeLoop();
	}

	private decodeLoop = () => {
		if (!this.isRunning) return;
		if (this.isPaused || !this.decoder) return;

		try {
			const FORMAT_F32 = this.module.SampleFormat.PlanarF32;
			const result = this.decoder.readChunk(this.req.chunkSize, FORMAT_F32);

			if (result.status.status < 0) {
				throw new Error(`Decode error: ${result.status.error}`);
			}

			if (result.samples.length > 0) {
				const chunkData = result.samples.slice() as Float32Array;
				this.post(
					{
						type: "CHUNK",
						id: this.req.id,
						data: chunkData,
						startTime: result.startTime,
					},
					[chunkData.buffer],
				);
			}

			if (result.isEOF) {
				this.post({ type: "EOF", id: this.req.id });
				this.isRunning = false;
			} else {
				// 让出主线程，避免 UI 卡死
				setTimeout(this.decodeLoop, 0);
			}
		} catch (e) {
			this.handleError(e);
		}
	};

	public pause() {
		this.isPaused = true;
	}

	public resume() {
		if (this.isPaused) {
			this.isPaused = false;
			this.decodeLoop();
		}
	}

	public seek(time: number, newId: number) {
		if (!this.decoder) return;
		try {
			const result = this.decoder.seek(time);
			if (result.status < 0) throw new Error(result.error);

			this.req.id = newId;

			this.post({ type: "SEEK_DONE", id: newId, time });

			this.isRunning = true;
			this.isPaused = false;
			this.decodeLoop();
		} catch (e) {
			this.post({
				type: "ERROR",
				id: newId,
				error: e instanceof Error ? e.message : String(e),
			});
			this.destroy();
		}
	}

	public setTempo(tempo: number) {
		this.decoder?.setTempo(tempo);
	}

	public setPitch(pitch: number) {
		this.decoder?.setPitch(pitch);
	}

	public destroy() {
		this.isRunning = false;

		if (this.decoder) {
			this.decoder.close();
			this.decoder.delete();
			this.decoder = null;
		}

		if (this.module && this.mountDir) {
			try {
				this.module.FS.unmount(this.mountDir);
				this.module.FS.rmdir(this.mountDir);
			} catch {
				// 忽略卸载错误
			}
		}
	}

	private handleError(e: unknown) {
		this.post({
			type: "ERROR",
			id: this.req.id,
			error: e instanceof Error ? e.message : String(e),
		});
		this.destroy();
	}

	private post(msg: WorkerResponse, transfer: Transferable[] = []) {
		self.postMessage(msg, transfer);
	}
}

async function handleExportWav(req: WorkerRequest & { type: "EXPORT_WAV" }) {
	const module = await getModule();
	const mountDir = `/export_${req.id}`;
	let decoder: AudioStreamDecoder | null = null;

	try {
		try {
			module.FS.mkdir(mountDir);
			module.FS.mount(
				module.FS.filesystems.WORKERFS,
				{ files: [req.file] },
				mountDir,
			);
		} catch {
			// 忽略目录已存在错误
		}

		decoder = new module.AudioStreamDecoder();
		const filePath = `${mountDir}/${req.file.name}`;
		const props = decoder.init(filePath);

		if (props.status.status < 0) {
			throw new Error(`Export init failed: ${props.status.error}`);
		}

		const chunks: Int16Array[] = [];
		const CHUNK_SIZE = 4096 * 16;
		const FORMAT_S16 = module.SampleFormat.InterleavedS16;
		const duration = props.duration;
		let processedTime = 0;

		while (true) {
			const result = decoder.readChunk(CHUNK_SIZE, FORMAT_S16);

			if (result.status.status < 0) {
				throw new Error(`Export decode error: ${result.status.error}`);
			}

			if (result.samples.length > 0) {
				chunks.push(result.samples.slice() as Int16Array);
				processedTime = result.startTime;
				self.postMessage({
					type: "EXPORT_WAV_PROGRESS",
					id: req.id,
					progress: processedTime / duration,
				});
			}

			if (result.isEOF) break;
		}

		const totalSamples = chunks.reduce((acc, curr) => acc + curr.length, 0);
		const dataByteLength = totalSamples * 2; // Int16 = 2 bytes

		const wavHeader = createWavHeader(
			props.sampleRate,
			props.channelCount,
			dataByteLength,
		);

		const blob = new Blob([wavHeader, ...chunks] as BlobPart[], {
			type: "audio/wav",
		});

		self.postMessage({
			type: "EXPORT_WAV_DONE",
			id: req.id,
			blob: blob,
		});
	} catch (e) {
		self.postMessage({
			type: "ERROR",
			id: req.id,
			error: (e as Error).message,
		});
	} finally {
		if (decoder) {
			decoder.close();
			decoder.delete();
		}
		try {
			module.FS.unmount(mountDir);
			module.FS.rmdir(mountDir);
		} catch {}
	}
}

function createWavHeader(
	sampleRate: number,
	channels: number,
	dataLength: number,
): Uint8Array {
	const buffer = new ArrayBuffer(44);
	const view = new DataView(buffer);

	// RIFF chunk descriptor
	writeString(view, 0, "RIFF");
	view.setUint32(4, 36 + dataLength, true); // File size - 8
	writeString(view, 8, "WAVE");

	// fmt sub-chunk
	writeString(view, 12, "fmt ");
	view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
	view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
	view.setUint16(22, channels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * channels * 2, true); // ByteRate
	view.setUint16(32, channels * 2, true); // BlockAlign
	view.setUint16(34, 16, true); // BitsPerSample

	// data sub-chunk
	writeString(view, 36, "data");
	view.setUint32(40, dataLength, true);

	return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
	for (let i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

let currentSession: DecoderSession | null = null;

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
	const req = e.data;

	switch (req.type) {
		case "INIT":
			currentSession?.destroy();
			currentSession = null;

			try {
				const module = await getModule();
				currentSession = new DecoderSession(module, req);
			} catch (err) {
				self.postMessage({
					type: "ERROR",
					id: req.id,
					error: `Module load failed: ${(err as Error).message}`,
				});
				console.error(err);
			}
			break;
		case "PAUSE":
			if (currentSession && currentSession.req.id === req.id) {
				currentSession.pause();
				self.postMessage({ type: "ACK", id: req.id });
			}
			break;
		case "RESUME":
			if (currentSession && currentSession.req.id === req.id) {
				currentSession.resume();
				self.postMessage({ type: "ACK", id: req.id });
			}
			break;
		case "SEEK":
			if (currentSession) {
				currentSession.seek(req.seekTime, req.id);
			}
			break;
		case "SET_TEMPO":
			if (currentSession) {
				currentSession.setTempo(req.value);
				self.postMessage({ type: "ACK", id: req.id });
			}
			break;
		case "SET_PITCH":
			if (currentSession) {
				currentSession.setPitch(req.value);
				self.postMessage({ type: "ACK", id: req.id });
			}
			break;
		case "EXPORT_WAV":
			handleExportWav(req);
			break;
	}
};
