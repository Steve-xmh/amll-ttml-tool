import type { LyricLine } from "$/utils/ttml-types";

export function normalizeLineTime(line: LyricLine) {
	if (!line.words.length) return;
	line.startTime = line.words[0].startTime || line.startTime;
	line.endTime = line.words[line.words.length - 1].endTime || line.endTime;
}
