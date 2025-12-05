import { atom } from "jotai";
import type { ProcessedLyricLine } from "$/utils/segment-processing.ts";

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

type LinePanOperation = {
	type: "line-pan";
	lineId: string;
	initialMouseTimeMS: number;
	initialLineStartMS: number;
};

export type TimelineDragOperation =
	| DividerDragOperation
	| WordPanOperation
	| LinePanOperation;

export const timelineDragAtom = atom<TimelineDragOperation | null>(null);

export const previewLineAtom = atom<ProcessedLyricLine | null>(null);

export const isDraggingAtom = atom((get) => get(timelineDragAtom) !== null);

export const selectedWordIdAtom = atom<string | null>(null);

/**
 * @description 用于控制全局文件拖拽遮罩层的显示
 */
export const isGlobalFileDraggingAtom = atom(false);
