import { audioBufferAtom } from "$/states/audio.ts";
import { auditionTimeAtom } from "$/states/spectrogram.ts";
import { globalStore } from "$/states/store.ts";
import { log } from "./logging.ts";

// Magic, pending original dev's explanation
// Even don't know where should I put this after refactoring
// const DELAY = 0.05; // 50ms

let auditionRafId: number | null = null;

class AudioEngine extends EventTarget {
	//#region Audio context basics
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
	//#endregion

	//#region Audio element
	// Since an element is required to sync with waveform.js,
	// all audio playback is done through this element
	private _audioEl: HTMLAudioElement | null = null;
	get audioEl() {
		if (this._audioEl) return this._audioEl;
		this._audioEl = document.createElement("audio");
		this._audioEl.preload = "metadata";
		return this._audioEl;
	}

	/** Connect AudioElement to AudioContext, called after load finished */
	private connectAudioToContext() {
		if (!this._audioEl || !this.ctx || this._audioEl.src === "") return;
		try {
			const source = this.ctx.createMediaElementSource(this._audioEl);
			source?.connect(this.gain);
			log("AudioElement connected to AudioContext");
		} catch (e) {
			log("Failed to connect AudioElement:", e);
		}
	}

	/** Handle browser autoplay policy */
	private async resumeContext() {
		if (this.ctx.state === "suspended") {
			await this.ctx.resume();
			log("AudioContext resumed");
		}
	}

	/** Link audio element events into engine events */
	private setupAudioListeners() {
		const audioEl = this._audioEl;
		if (!audioEl) return;
		const events = {
			play: "music-resume",
			pause: "music-pause",
			timeupdate: "music-seeked",
			ended: "music-pause",
			seeked: "music-seeked",
			volumechange: "volume-change",
			ratechange: "music-playback-rate-change",
		};
		Object.entries(events).forEach(([event, engineEvent]) => {
			audioEl.addEventListener(event, () => {
				this.dispatchEvent(new Event(engineEvent));
			});
		});
	}
	//#endregion

	//#region Playback
	private auditionSourceNode: AudioBufferSourceNode | null = null;

	get musicLoaded() {
		return !!this.musicBuffer;
	}

	get musicPlaying() {
		return !this._audioEl?.paused && !this._audioEl?.ended;
	}

	get musicCurrentTime() {
		return this._audioEl?.currentTime ?? 0;
	}

	get musicDuration() {
		return this._audioEl?.duration ?? 0;
	}

	private _musicPlayBackRate = 1;
	get musicPlayBackRate() {
		return this._musicPlayBackRate;
	}
	set musicPlayBackRate(v: number) {
		if (this._audioEl) {
			this._audioEl.playbackRate = v;
		}
		this._musicPlayBackRate = v;
		this.dispatchEvent(new Event("music-playback-rate-change"));
	}

	get volume() {
		return this.gain.gain.value;
	}
	set volume(v: number) {
		this.gain.gain.value = v;
		this.dispatchEvent(new Event("volume-change"));
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

	seekMusic(offset: number) {
		if (this._audioEl) {
			this._audioEl.currentTime = offset;
			this.dispatchEvent(new Event("music-seeked"));
		}
	}

	async resumeOrSeekMusic(offset = this.musicCurrentTime) {
		if (!this._audioEl) return;
		await this.resumeContext();
		this._audioEl.currentTime = offset;
		this._audioEl.play();
		this.dispatchEvent(new Event("music-resume"));
	}

	pauseMusic() {
		if (!this._audioEl) return;
		this._audioEl.pause();
		this.dispatchEvent(new Event("music-pause"));
	}

	/**
	 * 试听一个音频片段
	 *
	 * @param startTimeInSeconds 音频片段的开始时间
	 * @param endTimeInSeconds 音频片段的结束时间
	 * @returns
	 */
	auditionRange(startTimeInSeconds: number, endTimeInSeconds: number) {
		if (!this.musicBuffer) {
			console.warn("musicBuffer 为 null, 无法预览音频");
			return;
		}

		if (this.auditionSourceNode) {
			try {
				this.auditionSourceNode.stop(0);
				this.auditionSourceNode.disconnect();
			} catch (e) {
				console.error("停止 AudioNode 失败:", e);
			}
			this.auditionSourceNode = null;
		}

		if (auditionRafId) {
			cancelAnimationFrame(auditionRafId);
			auditionRafId = null;
		}

		globalStore.set(auditionTimeAtom, null);

		const durationInSeconds = endTimeInSeconds - startTimeInSeconds;

		if (durationInSeconds <= 0) {
			return;
		}

		this.resumeContext();

		const audioCtxStartTime = this.ctx.currentTime;
		const mediaStartTime = startTimeInSeconds;

		const source = this.ctx.createBufferSource();
		source.buffer = this.musicBuffer;
		source.connect(this.gain);
		this.auditionSourceNode = source;

		const progressLoop = () => {
			const elapsedTime = this.ctx.currentTime - audioCtxStartTime;
			const currentAuditionTime = mediaStartTime + elapsedTime;

			if (currentAuditionTime >= endTimeInSeconds) {
				globalStore.set(auditionTimeAtom, null);
				auditionRafId = null;
			} else {
				globalStore.set(auditionTimeAtom, currentAuditionTime);
				auditionRafId = requestAnimationFrame(progressLoop); // 请求下一帧
			}
		};

		source.addEventListener("ended", () => {
			if (auditionRafId) {
				cancelAnimationFrame(auditionRafId);
				auditionRafId = null;
			}
			globalStore.set(auditionTimeAtom, null);

			if (this.auditionSourceNode === source) {
				this.auditionSourceNode = null;
			}
			source.disconnect();
		});

		source.start(audioCtxStartTime, mediaStartTime, durationInSeconds);
		auditionRafId = requestAnimationFrame(progressLoop);
	}

	//#endregion

	//#region Load sound
	private musicBuffer: AudioBuffer | null = null;

	/** Load music from a Blob source and return AudioElement */
	async loadMusic(src: Blob): Promise<HTMLAudioElement> {
		const audioEl = this.audioEl;
		if (this.musicBuffer) {
			this.pauseMusic();
			this.musicBuffer = null;
			globalStore.set(audioBufferAtom, null);
			audioEl.src = "";
			this.dispatchEvent(new Event("music-unload"));
		}
		this.dispatchEvent(new Event("music-loading"));
		return new Promise((resolve) => {
			audioEl.onloadedmetadata = async () => {
				const audioData = await src.arrayBuffer();
				this.musicBuffer = await this.ctx.decodeAudioData(audioData);
				globalStore.set(audioBufferAtom, this.musicBuffer);
				this.connectAudioToContext();
				this.setupAudioListeners();
				audioEl.onloadedmetadata = null;
				this.dispatchEvent(new Event("music-load"));
				resolve(audioEl);
			};
			audioEl.src = URL.createObjectURL(src);
		});
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
	//#endregion

	//#region Misc
	decodeAudioData(
		audioData: ArrayBuffer,
		successCallback?: DecodeSuccessCallback | null,
		errorCallback?: DecodeErrorCallback | null,
	): Promise<AudioBuffer> {
		return this.ctx.decodeAudioData(audioData, successCallback, errorCallback);
	}
	//#endregion
}

export const audioEngine = new AudioEngine();
