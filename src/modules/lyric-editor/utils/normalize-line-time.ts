import type { LyricLine } from "$/types/ttml";

export function normalizeLineTime(line: LyricLine) {
	if (!line.words.length) return;
	line.startTime = line.words[0].startTime || line.startTime;
	line.endTime = line.words[line.words.length - 1].endTime || line.endTime;
}
