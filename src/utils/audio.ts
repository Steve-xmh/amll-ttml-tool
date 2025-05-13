import { log } from "./logging.ts";

const DELAY = 0.05; // 50ms

class AudioEngine extends EventTarget {
	private _ctx: AudioContext | null = null;
	get ctx() {
		if (this._ctx) return this._ctx;
		this._ctx = new AudioContext({
			latencyHint: "interactive",
		});
		log(
			"AudioContext created with latency",
			this._ctx.baseLatency,
			this._ctx.outputLatency,
		);
		return this._ctx;
	}
	private gainNode: GainNode | null = null;
	private get gain() {
		if (this.gainNode) return this.gainNode;
		this.gainNode = this.ctx.createGain();
		this.gainNode.gain.value = 0.5;
		this.gainNode.connect(this.ctx.destination);
		return this.gainNode;
	}

	get volume() {
		return this.gain.gain.value;
	}

	set volume(v: number) {
		this.gain.gain.value = v;
		this.dispatchEvent(new Event("volume-change"));
	}

	private _musicPlayBackRate = 1;

	get musicPlayBackRate() {
		return this._musicPlayBackRate;
	}

	set musicPlayBackRate(v: number) {
		if (this.musicPlaying) {
			const ct = this.musicCurrentTime;
			this._musicPlayBackRate = v;
			this.resumeOrSeekMusic(ct);
		} else {
			this._musicPlayBackRate = v;
		}
		this.dispatchEvent(new Event("music-playback-rate-change"));
	}

	get ctxCurrentTime() {
		return this.ctx.currentTime;
	}
	get ctxBaseLatency() {
		return this.ctx.baseLatency;
	}
	get ctxOutputLatency() {
		return this.ctx.outputLatency;
	}
	private musicBuffer: AudioBuffer | null = null;
	private musicNode: AudioBufferSourceNode | null = null;
	private musicStartTime = 0;
	private musicStartOffset = 0;
	_musicWaveform: Float32Array = new Float32Array(0);
	get musicWaveform() {
		return this._musicWaveform;
	}

	decodeAudioData(
		audioData: ArrayBuffer,
		successCallback?: DecodeSuccessCallback | null,
		errorCallback?: DecodeErrorCallback | null,
	): Promise<AudioBuffer> {
		return this.ctx.decodeAudioData(audioData, successCallback, errorCallback);
	}

	async loadMusic(src: Blob) {
		const audioData = await src.arrayBuffer();
		if (this.musicBuffer) {
			this.pauseMusic();
			this.musicBuffer = null;
			this._musicWaveform = new Float32Array(0);
			this.dispatchEvent(new Event("music-unload"));
		}
		this.dispatchEvent(new Event("music-loading"));
		this.musicBuffer = await this.ctx.decodeAudioData(audioData);
		await this.generateMusicWaveform();
		this.dispatchEvent(new Event("music-load"));
	}

	private async generateMusicWaveform() {
		const audioData = this.musicBuffer;
		if (audioData == null) {
			this._musicWaveform = new Float32Array(0);
			return;
		}
		const waveform = new Float32Array(audioData.length);
		let max = 0;
		for (let c = 0; c < audioData.numberOfChannels; c++) {
			const ch = audioData.getChannelData(c);
			for (let i = 0; i < audioData.length; i++) {
				waveform[i] += ch[i];
				max = Math.max(max, Math.abs(ch[i]));
			}
		}
		for (let i = 0; i < audioData.length; i++) {
			waveform[i] = waveform[i] / audioData.numberOfChannels / max;
		}
		this._musicWaveform = waveform;
	}

	get musicLoaded() {
		return !!this.musicBuffer;
	}

	get musicPlaying() {
		return !!this.musicNode;
	}

	get musicCurrentTime() {
		if (!this.musicBuffer) return 0;
		if (!this.musicNode) return this.musicStartOffset;
		return (
			this.musicStartOffset +
			Math.max(
				0,
				Math.min(
					this.musicDuration,
					(this.ctx.currentTime - this.musicStartTime) *
						this._musicPlayBackRate,
				),
			)
		);
	}

	get musicDuration() {
		if (!this.musicBuffer) return 0;
		return this.musicBuffer.duration;
	}

	seekMusic(offset: number) {
		if (this.musicPlaying) this.resumeOrSeekMusic(offset);
		else this.musicStartOffset = offset;
		this.dispatchEvent(new Event("music-seeked"));
	}

	resumeOrSeekMusic(offset = this.musicStartOffset) {
		if (!this.musicBuffer) return;
		if (this.musicNode) {
			this.musicNode.stop();
			this.musicNode = null;
		}
		const source = this.ctx.createBufferSource();
		source.buffer = this.musicBuffer;
		source.playbackRate.value = this._musicPlayBackRate;
		source.connect(this.gain);
		source.addEventListener("ended", () => {
			if (this.musicNode === source) this.pauseMusic();
		});
		this.musicStartTime = this.ctx.currentTime + DELAY; // 延迟播放以缓解误差
		this.musicStartOffset = offset;
		source.start(this.musicStartTime, this.musicStartOffset);
		this.musicNode = source;
		this.dispatchEvent(new Event("music-resume"));
	}

	playSound(
		audioBuffer: AudioBuffer,
		when?: number,
		offset?: number,
		duration?: number,
	) {
		if (!this.ctx) return;
		const source = this.ctx.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(this.gain);
		source.start(when, offset, duration);
		source.addEventListener("ended", () => {
			source.disconnect();
		});
	}

	playNode(node: AudioScheduledSourceNode, when?: number, stop?: number) {
		node.connect(this.gain);
		node.start(when);
		node.addEventListener("ended", () => {
			node.disconnect();
		});
		if (stop) node.stop(stop);
	}

	pauseMusic() {
		if (!this.musicBuffer) return;
		if (!this.musicNode) return;
		this.musicStartOffset = Math.max(
			0,
			Math.min(this.musicDuration, this.musicCurrentTime),
		);
		const oldNode = this.musicNode;
		this.musicNode = null;
		oldNode.stop();
		oldNode.disconnect();
		this.dispatchEvent(new Event("music-pause"));
	}
}

export const audioEngine = new AudioEngine();
