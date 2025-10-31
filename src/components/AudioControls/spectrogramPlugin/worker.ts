// Originally from wavesurfer.js spectrogram plugin, licensed under MIT
// Modified by @Linho1219, released in amll-ttml-tool-vue, licensed under MIT

// Import centralized FFT functionality
import FFT from "wavesurfer.js/dist/fft.js";

// Global FFT instance (reused for performance)
let fft: FFT | null = null;

interface WorkerMessage {
	type: string;
	id: string;
	audioData: Float32Array[];
	options: {
		startTime: number;
		endTime: number;
		sampleRate: number;
		fftSamples: number;
		windowFunc: string;
		alpha?: number;
		hopSize: number;
		scale: "linear" | "logarithmic" | "mel" | "bark" | "erb";
		gain: number;
		noiseFloor: number;
		maxThresOfMaxMagnitude: number;
		logRatio: number;
		splitChannels: boolean;
	};
}

interface WorkerResponse {
	type: string;
	id: string;
	result?: Uint8Array[][];
	error?: string;
}

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
	const { type, id, audioData, options } = e.data;

	if (type === "calculateFrequencies") {
		try {
			const result = calculateFrequencies(audioData, options);
			const response: WorkerResponse = {
				type: "frequenciesResult",
				id: id,
				result: result,
			};
			self.postMessage(response);
		} catch (error) {
			const response: WorkerResponse = {
				type: "frequenciesResult",
				id: id,
				error: error instanceof Error ? error.message : String(error),
			};
			self.postMessage(response);
		}
	}
};

/**
 * Calculate frequency data for audio channels
 */
function calculateFrequencies(
	audioChannels: Float32Array[],
	options: WorkerMessage["options"],
): Uint8Array[][] {
	const {
		startTime,
		endTime,
		sampleRate,
		fftSamples,
		windowFunc,
		alpha,
		hopSize,
		gain,
		noiseFloor,
		maxThresOfMaxMagnitude,
		logRatio,
		splitChannels,
	} = options;

	const startSample = Math.floor(startTime * sampleRate);
	const endSample = Math.floor(endTime * sampleRate);
	const channels = splitChannels ? audioChannels.length : 1;

	// Initialize FFT (reuse if possible for performance)
	if (!fft || fft.bufferSize !== fftSamples) {
		fft = new (FFT as any)(fftSamples, sampleRate, windowFunc, alpha || 0.16);
	}

	const frequencies: Uint8Array[][] = [];

	for (let c = 0; c < channels; c++) {
		const channelData = audioChannels[c]!;
		const channelFreq: Uint8Array[] = [];

		for (
			let sample = startSample;
			sample + fftSamples < endSample;
			sample += hopSize
		) {
			const segment = channelData.slice(sample, sample + fftSamples);
			let spectrum = fft.calculateSpectrum(segment) as Float32Array;

			// Convert to uint8 color indices
			const freqBins = new Uint8Array(spectrum.length);
			const maxMagnitude = Math.max(
				noiseFloor,
				...spectrum.slice(0, spectrum.length * maxThresOfMaxMagnitude),
			);
			const colorIndices = spectrum.map((magnitude) => {
				const normalized = magnitude / maxMagnitude;
				const logVal = Math.log10(normalized * 9 + 1);
				return Math.round(Math.min(1, logVal * gain) * 255);
			});
			for (let j = 0; j < spectrum.length; j++) {
				const linearIndex = j;
				const logIndex =
					Math.exp((j * Math.log(spectrum.length)) / (spectrum.length - 1)) - 1;
				const blendedIndex = linearIndex * (1 - logRatio) + logIndex * logRatio;
				const flooredIndex = Math.floor(blendedIndex);
				const ceiledIndex = Math.min(
					spectrum.length - 1,
					Math.ceil(blendedIndex),
				);
				const weight = blendedIndex - flooredIndex;
				// Linear interpolation
				freqBins[j] = Math.round(
					colorIndices[flooredIndex]! * (1 - weight) +
						colorIndices[ceiledIndex]! * weight,
				);
			}
			channelFreq.push(freqBins);
		}
		frequencies.push(channelFreq);
	}

	return frequencies;
}
