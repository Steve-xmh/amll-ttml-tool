import { atom } from "jotai";
import type { ProcessedLyricLine } from "$/utils/segment-processing.ts";

export interface DragDetails {
	lineId: string;
	segmentIndex: number;
	zoom: number;
	startX: number;
	isGapCreation: boolean;
}

export const dragDetailsAtom = atom<DragDetails | null>(null);

export const wordPanOperationAtom = atom<null | {
	type: "word-pan";
	lineId: string;
	wordId: string;
	initialMouseTimeMS: number;
	initialWordStartMS: number;
}>(null);

export const previewLineAtom = atom<ProcessedLyricLine | null>(null);

export const isDraggingAtom = atom(
	(get) => get(dragDetailsAtom) !== null || get(wordPanOperationAtom) !== null,
);

export const selectedWordIdAtom = atom<string | null>(null);
