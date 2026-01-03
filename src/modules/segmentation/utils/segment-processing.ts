import { atom } from "jotai";
import { lyricLinesAtom } from "$/states/main.ts";
import type { LyricLine, LyricWord } from "$/types/ttml";

export interface WordSegment extends LyricWord {
	type: "word";
}

export interface GapSegment {
	type: "gap";
	id: string;
	startTime: number;
	endTime: number;
}

export type ProcessedSegment = WordSegment | GapSegment;

export interface ProcessedLyricLine extends Omit<LyricLine, "words"> {
	segments: ProcessedSegment[];
}

export function processSingleLine(line: LyricLine): ProcessedLyricLine {
	const segments: ProcessedSegment[] = [];

	const validWords = [...line.words]
		.filter((w) => w.endTime > w.startTime)
		.sort((a, b) => a.startTime - b.startTime);

	let cursor = line.startTime;

	for (const word of validWords) {
		if (word.startTime > cursor) {
			segments.push({
				type: "gap",
				id: `${line.id}-gap-${cursor}`,
				startTime: cursor,
				endTime: word.startTime,
			});
		}

		segments.push({ ...word, type: "word" });

		cursor = word.endTime;
	}

	if (line.endTime > cursor) {
		segments.push({
			type: "gap",
			id: `${line.id}-gap-end`,
			startTime: cursor,
			endTime: line.endTime,
		});
	}

	return {
		...line,
		segments: segments,
	};
}

function createProcessedLyricLines(
	dirtyLines: LyricLine[],
): ProcessedLyricLine[] {
	return dirtyLines.map(processSingleLine);
}

export const processedLyricLinesAtom = atom<ProcessedLyricLine[]>((get) => {
	const { lyricLines } = get(lyricLinesAtom);
	if (!lyricLines) return [];
	return createProcessedLyricLines(lyricLines);
});
