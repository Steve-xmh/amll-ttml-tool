export type PlayerState =
	| "idle"
	| "loading"
	| "ready"
	| "playing"
	| "paused"
	| "error";

export interface AudioMetadata {
	sampleRate: number;
	channels: number;
	duration: number;
	metadata: Record<string, string>;
	encoding: string;
	coverUrl?: string | undefined;
	bitsPerSample: number;
}

export interface PlayerEventMap {
	loadstart: undefined;
	loadedmetadata: undefined;
	canplay: undefined;
	play: undefined;
	playing: undefined;
	pause: undefined;
	waiting: undefined;
	seeking: undefined;
	seeked: undefined;
	timeupdate: number;
	volumechange: number;
	durationchange: number;
	ended: undefined;
	error: string;
	emptied: undefined;
}

export type WorkerRequest =
	| { type: "INIT"; id: number; file: File; chunkSize: number }
	| { type: "PAUSE"; id: number }
	| { type: "RESUME"; id: number }
	| { type: "SEEK"; id: number; seekTime: number }
	| { type: "SET_TEMPO"; id: number; value: number }
	| { type: "SET_PITCH"; id: number; value: number }
	| { type: "EXPORT_WAV"; id: number; file: File };

export type WorkerResponse =
	| { type: "ERROR"; id: number; error: string }
	| { type: "ACK"; id: number }
	| {
			type: "METADATA";
			id: number;
			sampleRate: number;
			channels: number;
			duration: number;
			metadata: Record<string, string>;
			encoding: string;
			coverUrl?: string | undefined;
			bitsPerSample: number;
	  }
	| {
			type: "CHUNK";
			id: number;
			data: Float32Array;
			time?: number;
			startTime: number;
	  }
	| { type: "EOF"; id: number }
	| { type: "SEEK_DONE"; id: number; time: number }
	| { type: "EXPORT_WAV_PROGRESS"; id: number; progress: number }
	| { type: "EXPORT_WAV_DONE"; id: number; blob: Blob };

export type WorkerRequestType = WorkerRequest["type"];

export type WorkerResponseMap = {
	INIT: WorkerResponse & { type: "METADATA" };
	PAUSE: undefined;
	RESUME: undefined;
	SEEK: number;
	SET_TEMPO: undefined;
	SET_PITCH: undefined;
	EXPORT_WAV: Blob;
};

/**
 * 除去 type 和 id 后的 Payload
 */
export type WorkerRequestPayload<T extends WorkerRequestType> = Omit<
	Extract<WorkerRequest, { type: T }>,
	"type" | "id"
>;

export interface EmbindObject {
	delete(): void;
	isDeleted(): boolean;
}

export interface StringList extends EmbindObject {
	size(): number;
	get(index: number): string;
}

export interface StringMap extends EmbindObject {
	keys(): StringList;
	get(key: string): string;
	set(key: string, value: string): void;
	size(): number;
}

export interface Uint8List extends EmbindObject {
	size(): number;
	get(index: number): number;
}

export interface DecoderStatus {
	status: number;
	error: string;
}

export interface AudioProperties {
	status: DecoderStatus;
	encoding: string;
	sampleRate: number;
	channelCount: number;
	duration: number;
	metadata: StringMap;
	coverArt: Uint8List;
	bitsPerSample: number;
}

export enum SampleFormat {
	PlanarF32 = 0,
	InterleavedS16 = 1,
}

export interface ChunkResult {
	status: DecoderStatus;
	samples: Float32Array | Int16Array;
	isEOF: boolean;
	startTime: number;
}

export interface AudioStreamDecoder extends EmbindObject {
	init(path: string): AudioProperties;
	readChunk(chunkSize: number, format?: SampleFormat): ChunkResult;
	seek(timestamp: number): DecoderStatus;
	close(): void;
	setTempo(tempo: number): void;
	setPitch(pitch: number): void;
	delete(): void;
}

export interface AudioDecoderModule extends EmscriptenModule {
	FS: typeof FS & {
		filesystems: {
			WORKERFS: Emscripten.FileSystemType;
		};
	};
	AudioStreamDecoder: {
		new (): AudioStreamDecoder;
	};
	SampleFormat: typeof SampleFormat;
}
