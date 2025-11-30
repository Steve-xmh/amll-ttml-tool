import init, {
	generate_spectrogram_image,
	initThreadPool,
} from "$/pkg/spectrogram/wasm_spectrogram";
import type { WorkerRequest } from "$/types/spectrogram";

let fullAudioData: Float32Array | null = null;
let audioSampleRate: number = 0;
let wasmInitialized: Promise<void> | null = null;
let currentPalette: Uint8Array | null = null;

async function initializeWasm() {
	if (!wasmInitialized) {
		wasmInitialized = (async () => {
			await init();
			await initThreadPool(navigator.hardwareConcurrency);
		})();
	}
	await wasmInitialized;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
	await initializeWasm();

	const msg = event.data;

	if (msg.type === "INIT") {
		fullAudioData = msg.audioData;
		audioSampleRate = msg.sampleRate;
		currentPalette = null;
		self.postMessage({ type: "INIT_COMPLETE" });
	} else if (msg.type === "SET_PALETTE") {
		currentPalette = msg.palette;
	} else if (msg.type === "GET_TILE") {
		const { reqId, params } = msg;

		if (!fullAudioData || !audioSampleRate || !currentPalette) {
			self.postMessage({ type: "ERROR", reqId, message: "Worker not ready" });
			return;
		}

		const { startTime, endTime, gain, tileWidthPx } = params;

		const startSample = Math.floor(startTime * audioSampleRate);
		const endSample = Math.ceil(endTime * audioSampleRate);

		if (startSample >= fullAudioData.length) {
			self.postMessage({ type: "ERROR", reqId, message: "Out of bounds" });
			return;
		}
		const audioSlice = fullAudioData.slice(
			startSample,
			Math.min(endSample, fullAudioData.length),
		);

		const TILE_HEIGHT = 256;

		try {
			const pixelData = generate_spectrogram_image(
				audioSlice,
				audioSampleRate,
				1024,
				64,
				tileWidthPx,
				TILE_HEIGHT,
				gain,
				currentPalette,
			);

			const canvas = new OffscreenCanvas(tileWidthPx, TILE_HEIGHT);
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("getContext 失败");

			const imageData = new ImageData(
				new Uint8ClampedArray(pixelData),
				tileWidthPx,
				TILE_HEIGHT,
			);
			ctx.putImageData(imageData, 0, 0);

			const imageBitmap = canvas.transferToImageBitmap();
			self.postMessage(
				{
					type: "TILE_READY",
					reqId,
					imageBitmap,
				},
				{
					transfer: [imageBitmap],
				},
			);
		} catch (e) {
			self.postMessage({ type: "ERROR", reqId, message: (e as Error).message });
		}
	}
};
