import init, {
	generate_spectrogram_image,
} from "../pkg/spectrogram/wasm_spectrogram";

let wasmInitialized = false;
let fullAudioData: Float32Array | null = null;
let audioSampleRate: number = 0;

async function initializeWasm() {
	if (!wasmInitialized) {
		await init();
		wasmInitialized = true;
	}
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
		const pixelData = generate_spectrogram_image(
			audioSlice,
			audioSampleRate,
			1024,
			128,
			tileWidthPx,
			TILE_HEIGHT,
			gain,
		);

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
				},
				{
					transfer: [imageBitmap],
				},
			);
		}
	}
};
