export interface TileGenerationParams {
	tileIndex: number;
	startTime: number;
	endTime: number;
	gain: number;
	tileWidthPx: number;
	paletteId: string;
}

export type WorkerRequest =
	| { type: "INIT"; audioData: Float32Array; sampleRate: number }
	| { type: "SET_PALETTE"; palette: Uint8Array }
	| { type: "GET_TILE"; reqId: number; params: TileGenerationParams };

export type WorkerResponse =
	| { type: "INIT_COMPLETE" }
	| { type: "TILE_READY"; reqId: number; imageBitmap: ImageBitmap }
	| { type: "ERROR"; reqId: number; message: string };
