import { useCallback, useEffect, useRef, useState } from "react";
import { LRUCache } from "$/utils/lru-cache.ts";

const MAX_CACHED_TILES = 70;

export type TileEntry = {
	bitmap: ImageBitmap;
	width: number;
	gain: number;
	paletteId: string;
};

export interface RequestTileParams {
	cacheId: string;
	reqId: string;
	startTime: number;
	endTime: number;
	gain: number;
	tileWidthPx: number;
	paletteId: string;
}

export const useSpectrogramWorker = (
	audioBuffer: AudioBuffer | null,
	paletteData: Uint8Array,
) => {
	const workerRef = useRef<Worker | null>(null);
	const tileCache = useRef<LRUCache<string, TileEntry>>(
		new LRUCache(MAX_CACHED_TILES, (_key, entry) => {
			entry.bitmap.close();
		}),
	);
	const requestedTiles = useRef<Set<string>>(new Set());

	const [lastTileTimestamp, setLastTileTimestamp] = useState(0);

	const paletteDataRef = useRef(paletteData);
	useEffect(() => {
		paletteDataRef.current = paletteData;
	}, [paletteData]);

	useEffect(() => {
		const worker = new Worker(
			new URL("../workers/spectrogram.worker.ts", import.meta.url),
			{ type: "module" },
		);
		workerRef.current = worker;

		worker.onmessage = (event: MessageEvent) => {
			const {
				type,
				tileId,
				imageBitmap,
				renderedWidth,
				gain: renderedGain,
				paletteId: renderedPaletteId,
			} = event.data;

			if (type === "TILE_READY") {
				if (tileId) {
					requestedTiles.current.delete(tileId);
				}

				if (
					tileId &&
					imageBitmap &&
					renderedWidth &&
					renderedGain != null &&
					renderedPaletteId != null
				) {
					const tileIndex = tileId.split("-")[1];
					if (tileIndex == null) {
						imageBitmap.close();
						return;
					}
					const cacheId = `tile-${tileIndex}`;
					const existingEntry = tileCache.current.get(cacheId);

					if (
						!existingEntry ||
						renderedWidth >= existingEntry.width ||
						renderedGain !== existingEntry.gain ||
						renderedPaletteId !== existingEntry.paletteId
					) {
						tileCache.current.set(cacheId, {
							bitmap: imageBitmap,
							width: renderedWidth,
							gain: renderedGain,
							paletteId: renderedPaletteId,
						});
					} else {
						imageBitmap.close();
					}
				}
				setLastTileTimestamp(Date.now());
			} else if (type === "INIT_COMPLETE") {
				requestedTiles.current.clear();

				if (workerRef.current && paletteDataRef.current) {
					workerRef.current.postMessage({
						type: "SET_PALETTE",
						palette: paletteDataRef.current,
					});
				}

				setLastTileTimestamp(Date.now());
			}
		};

		return () => worker.terminate();
	}, []);

	useEffect(() => {
		if (audioBuffer && workerRef.current) {
			tileCache.current.clear();
			requestedTiles.current.clear();
			setLastTileTimestamp(Date.now());

			const channelData = audioBuffer.getChannelData(0);
			const channelDataCopy = channelData.slice();

			workerRef.current.postMessage(
				{
					type: "INIT",
					audioData: channelDataCopy,
					sampleRate: audioBuffer.sampleRate,
				},
				[channelDataCopy.buffer],
			);
		}
	}, [audioBuffer]);

	useEffect(() => {
		if (workerRef.current && paletteData) {
			workerRef.current.postMessage({
				type: "SET_PALETTE",
				palette: paletteData,
			});
		}
	}, [paletteData]);

	const requestTileIfNeeded = useCallback(
		({
			cacheId,
			reqId,
			startTime,
			endTime,
			gain,
			tileWidthPx,
			paletteId,
		}: RequestTileParams) => {
			const cacheEntry = tileCache.current.get(cacheId);
			const currentWidth = cacheEntry?.width || 0;
			const currentGain = cacheEntry?.gain;
			const currentPaletteId = cacheEntry?.paletteId;

			const needsRequest =
				(tileWidthPx > currentWidth ||
					currentGain !== gain ||
					currentPaletteId !== paletteId) &&
				tileWidthPx > 0;

			if (needsRequest && !requestedTiles.current.has(reqId)) {
				requestedTiles.current.add(reqId);
				workerRef.current?.postMessage({
					type: "GET_TILE",
					tileId: reqId,
					startTime,
					endTime,
					gain,
					tileWidthPx,
					paletteId,
				});
			}
		},
		[],
	);

	return { tileCache, requestTileIfNeeded, lastTileTimestamp };
};
