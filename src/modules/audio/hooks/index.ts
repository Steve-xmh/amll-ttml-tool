export * from "./useAudioRegion";
export * from "./useHoverGuide";

export const clampZoom = (z: number) => Math.max(50, Math.min(z, 1000));
export const clampScroll = (
	s: number,
	currentZoom: number,
	totalDurationMs: number,
	containerWidthPx: number,
) => {
	if (totalDurationMs <= 0) return 0;
	const durationS = totalDurationMs / 1000;
	const totalWidth = durationS * currentZoom;
	const maxScroll = Math.max(0, totalWidth - containerWidthPx);
	return Math.max(0, Math.min(s, maxScroll));
};
