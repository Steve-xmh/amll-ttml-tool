export async function genWaveform(
	blobOrData: Blob | ArrayBufferLike,
): Promise<[Float32Array, number]> {
	let audioData: ArrayBufferLike;
	if (blobOrData instanceof Blob) {
		audioData = await blobOrData.arrayBuffer();
	} else {
		audioData = blobOrData;
	}
	const ac = new AudioContext();
	const decoded = await ac.decodeAudioData(audioData);
	const waveform = new Float32Array(decoded.length);
	let max = 0;
	for (let c = 0; c < decoded.numberOfChannels; c++) {
		const ch = decoded.getChannelData(c);
		for (let i = 0; i < decoded.length; i++) {
			waveform[i] += ch[i];
			max = Math.max(max, Math.abs(ch[i]));
		}
	}
	for (let i = 0; i < decoded.length; i++) {
		waveform[i] = waveform[i] / decoded.numberOfChannels / max;
	}
	return [waveform, decoded.sampleRate];
}
