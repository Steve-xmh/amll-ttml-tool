import { log } from "$/utils/logging";
import init, {
	generate_spectrogram_image,
	initThreadPool,
} from "../pkg/spectrogram/wasm_spectrogram";

let fullAudioData: Float32Array | null = null;
let audioSampleRate: number = 0;
let wasmInitialized: Promise<void> | null = null;

async function initializeWasm() {
	if (!wasmInitialized) {
		wasmInitialized = (async () => {
			await init();
			await initThreadPool(navigator.hardwareConcurrency);
		})();
	}
	await wasmInitialized;
}

self.onmessage = async (event: MessageEvent) => {
	await initializeWasm();
	const { type } = event.data;

	if (type === "INIT") {
		fullAudioData = event.data.audioData;
		audioSampleRate = event.data.sampleRate;
		self.postMessage({ type: "INIT_COMPLETE" });
	} else if (type === "GET_TILE") {
		if (!fullAudioData || !audioSampleRate) {
			return;
		}

		const { tileId, startTime, endTime, gain, tileWidthPx } = event.data;

		const startSample = Math.floor(startTime * audioSampleRate);
		const endSample = Math.ceil(endTime * audioSampleRate);

		if (startSample >= fullAudioData.length) {
			return;
		}
		const audioSlice = fullAudioData.slice(
			startSample,
			Math.min(endSample, fullAudioData.length),
		);

		const TILE_HEIGHT = 256;

		const t0 = performance.now();

		const pixelData = generate_spectrogram_image(
			audioSlice,
			audioSampleRate,
			1024,
			128,
			tileWidthPx,
			TILE_HEIGHT,
			gain,
		);

		const t1 = performance.now();

		log(`[Worker] ${tileId} width ${tileWidthPx} ${(t1 - t0).toFixed(2)} ms`);

		const canvas = new OffscreenCanvas(tileWidthPx, TILE_HEIGHT);
		const ctx = canvas.getContext("2d");
		if (ctx) {
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
					tileId,
					imageBitmap,
					renderedWidth: tileWidthPx,
					gain: gain,
				},
				{
					transfer: [imageBitmap],
				},
			);
		}
	}
};
