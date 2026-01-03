import { atom } from "jotai";
import type { ProcessedLyricLine } from "$/modules/segmentation/utils/segment-processing.ts";

type DividerDragOperation = {
	type: "divider";
	lineId: string;
	segmentIndex: number;
	zoom: number;
	startX: number;
	isGapCreation: boolean;
};

type WordPanOperation = {
	type: "word-pan";
	lineId: string;
	wordId: string;
	initialMouseTimeMS: number;
	initialWordStartMS: number;
};

export type TimelineDragOperation = DividerDragOperation | WordPanOperation;

export const timelineDragAtom = atom<TimelineDragOperation | null>(null);

export const previewLineAtom = atom<ProcessedLyricLine | null>(null);

export const isDraggingAtom = atom((get) => get(timelineDragAtom) !== null);

export const selectedWordIdAtom = atom<string | null>(null);
