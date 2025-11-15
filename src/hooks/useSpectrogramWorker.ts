import { useCallback, useEffect, useRef, useState } from "react";
import { LRUCache } from "$/utils/lru-cache.ts";

const MAX_CACHED_TILES = 70;

export type TileEntry = {
	bitmap: ImageBitmap;
	width: number;
	gain: number;
};

export interface RequestTileParams {
	cacheId: string;
	reqId: string;
	startTime: number;
	endTime: number;
	gain: number;
	tileWidthPx: number;
}

export const useSpectrogramWorker = (audioBuffer: AudioBuffer | null) => {
	const workerRef = useRef<Worker | null>(null);
	const tileCache = useRef<LRUCache<string, TileEntry>>(
		new LRUCache(MAX_CACHED_TILES, (_key, entry) => {
			entry.bitmap.close();
		}),
	);
	const requestedTiles = useRef<Set<string>>(new Set());

	const [lastTileTimestamp, setLastTileTimestamp] = useState(0);

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
			} = event.data;

			if (type === "TILE_READY") {
				if (tileId && imageBitmap && renderedWidth && renderedGain != null) {
					const tileIndex = tileId.split("-")[1];
					if (tileIndex == null) {
						imageBitmap.close();
						requestedTiles.current.delete(tileId);
						return;
					}
					const cacheId = `tile-${tileIndex}`;

					const existingEntry = tileCache.current.get(cacheId);

					if (
						!existingEntry ||
						renderedWidth >= existingEntry.width ||
						renderedGain !== existingEntry.gain
					) {
						tileCache.current.set(cacheId, {
							bitmap: imageBitmap,
							width: renderedWidth,
							gain: renderedGain,
						});
					} else {
						imageBitmap.close();
					}
					requestedTiles.current.delete(tileId);
				}
				setLastTileTimestamp(Date.now());
			} else if (type === "INIT_COMPLETE") {
				requestedTiles.current.clear();
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

	const requestTileIfNeeded = useCallback(
		({
			cacheId,
			reqId,
			startTime,
			endTime,
			gain,
			tileWidthPx,
		}: RequestTileParams) => {
			const cacheEntry = tileCache.current.get(cacheId);
			const currentWidth = cacheEntry?.width || 0;
			const currentGain = cacheEntry?.gain;

			const needsRequest =
				(tileWidthPx > currentWidth || currentGain !== gain) && tileWidthPx > 0;

			if (needsRequest && !requestedTiles.current.has(reqId)) {
				requestedTiles.current.add(reqId);
				workerRef.current?.postMessage({
					type: "GET_TILE",
					tileId: reqId,
					startTime,
					endTime,
					gain,
					tileWidthPx,
				});
			}
		},
		[],
	);

	return { tileCache, requestTileIfNeeded, lastTileTimestamp };
};
