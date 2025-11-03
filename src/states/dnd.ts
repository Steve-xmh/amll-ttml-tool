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

export const previewLineAtom = atom<ProcessedLyricLine | null>(null);

export const isDraggingAtom = atom((get) => get(dragDetailsAtom) !== null);

export const selectedWordIdAtom = atom<string | null>(null);
