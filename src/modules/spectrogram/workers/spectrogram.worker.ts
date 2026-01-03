import init, {
	generate_spectrogram_image,
	initThreadPool,
	SpectrogramConfig,
} from "$/modules/spectrogram/vendor";
import type { SpectrogramWorkerScope } from "$/modules/spectrogram/workers/types";

const ctx: SpectrogramWorkerScope = self as SpectrogramWorkerScope;

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

ctx.onmessage = async (event) => {
	await initializeWasm();

	const msg = event.data;

	switch (msg.type) {
		case "INIT":
			fullAudioData = msg.audioData;
			audioSampleRate = msg.sampleRate;
			currentPalette = null;
			ctx.postMessage({ type: "INIT_COMPLETE" });
			break;
		case "SET_PALETTE":
			currentPalette = msg.palette;
			break;
		case "GET_TILE": {
			const { reqId, params } = msg;

			if (!fullAudioData || !audioSampleRate || !currentPalette) {
				ctx.postMessage({
					type: "ERROR",
					reqId,
					message: "Worker not ready",
				});
				return;
			}

			const { startTime, endTime, gain, tileWidthPx, height } = params;

			const startSample = Math.floor(startTime * audioSampleRate);
			const endSample = Math.ceil(endTime * audioSampleRate);

			if (startSample >= fullAudioData.length) {
				ctx.postMessage({
					type: "ERROR",
					reqId,
					message: "Out of bounds",
				});
				return;
			}
			const audioSlice = fullAudioData.subarray(
				startSample,
				Math.min(endSample, fullAudioData.length),
			);

			const FFT_SIZE = 1024;
			const HOP_LENGTH = 64;

			try {
				const config = new SpectrogramConfig(
					audioSampleRate,
					FFT_SIZE,
					HOP_LENGTH,
					tileWidthPx,
					height,
					gain,
				);

				const pixelData = generate_spectrogram_image(
					audioSlice,
					currentPalette,
					config,
				);

				config.free();

				const canvas = new OffscreenCanvas(tileWidthPx, height);
				const context = canvas.getContext("2d");
				if (!context) throw new Error("OffscreenCanvas context 失败");

				const imageData = new ImageData(
					new Uint8ClampedArray(pixelData),
					tileWidthPx,
					height,
				);
				context.putImageData(imageData, 0, 0);

				const imageBitmap = canvas.transferToImageBitmap();
				ctx.postMessage(
					{
						type: "TILE_READY",
						reqId,
						imageBitmap,
					},
					[imageBitmap],
				);
			} catch (e) {
				ctx.postMessage({
					type: "ERROR",
					reqId,
					message: (e as Error).message,
				});
			}
			break;
		}
	}
};
