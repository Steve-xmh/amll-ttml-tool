import { lyricLinesAtom } from "$/states/main";
import { globalStore } from "$/states/store.ts";
import type {
	ProcessedLyricLine,
	WordSegment,
} from "$/utils/segment-processing.ts";

const MIN_DIVIDER_WIDTH_PX = 15;
const MIN_WORD_DURATION_MS = 10;

export function getUpdatedLineForDivider(
	originalLine: ProcessedLyricLine,
	/**
	 * 分割线左侧 segment 的索引
	 *
	 * -1 表示行首
	 */
	segmentIndex: number,
	/**
	 * 拖拽后计算出的新时间戳
	 */
	newTime: number,
	isGapCreation: boolean,
	zoom: number,
): ProcessedLyricLine {
	const segments = [...originalLine.segments];
	let newStartTime = originalLine.startTime;
	let newEndTime = originalLine.endTime;

	const minVisualDurationMs = (MIN_DIVIDER_WIDTH_PX / zoom) * 1000;
	const dynamicMinDurationMs = Math.max(
		MIN_WORD_DURATION_MS,
		minVisualDurationMs,
	);

	const leftSegment = segments[segmentIndex] || null;
	const rightSegment = segments[segmentIndex + 1] || null;

	const minTime =
		leftSegment && leftSegment.type === "word"
			? leftSegment.startTime + dynamicMinDurationMs
			: leftSegment
				? leftSegment.startTime
				: 0;

	const maxTime =
		rightSegment && rightSegment.type === "word"
			? rightSegment.endTime - dynamicMinDurationMs
			: rightSegment
				? rightSegment.endTime
				: Infinity;

	let clampedTime = Math.max(minTime, newTime);
	clampedTime = Math.min(maxTime, clampedTime);
	clampedTime = Math.max(0, clampedTime);

	const newSegments = [...segments];

	if (segmentIndex === -1) {
		if (rightSegment && rightSegment.type === "word") {
			clampedTime = Math.min(
				clampedTime,
				rightSegment.endTime - dynamicMinDurationMs,
			);
		}
		newStartTime = clampedTime;
		if (rightSegment) {
			newSegments[segmentIndex + 1] = {
				...rightSegment,
				startTime: clampedTime,
			};
		}
	} else if (segmentIndex === segments.length - 1) {
		if (leftSegment && leftSegment.type === "word") {
			clampedTime = Math.max(
				clampedTime,
				leftSegment.startTime + dynamicMinDurationMs,
			);
		}
		newEndTime = clampedTime;
		if (leftSegment) {
			newSegments[segmentIndex] = { ...leftSegment, endTime: clampedTime };
		}
	} else {
		const originalTime = leftSegment.endTime;
		if (isGapCreation) {
			if (clampedTime > originalTime) {
				newSegments[segmentIndex + 1] = {
					...rightSegment,
					startTime: clampedTime,
				};
			} else if (clampedTime < originalTime) {
				newSegments[segmentIndex] = { ...leftSegment, endTime: clampedTime };
			}
		} else {
			newSegments[segmentIndex] = { ...leftSegment, endTime: clampedTime };
			newSegments[segmentIndex + 1] = {
				...rightSegment,
				startTime: clampedTime,
			};
		}
	}

	return {
		...originalLine,
		startTime: newStartTime,
		endTime: newEndTime,
		segments: newSegments,
	};
}

export function commitUpdatedLine(updatedLine: ProcessedLyricLine) {
	const updatedValidSegments = updatedLine.segments.filter(
		(s): s is WordSegment => s.type === "word",
	);

	const updatedWordsMap = new Map<string, WordSegment>(
		updatedValidSegments.map((s) => [s.id, s]),
	);

	globalStore.set(lyricLinesAtom, (prev) => {
		const newLines = prev.lyricLines.map((line) => {
			if (line.id !== updatedLine.id) {
				return line;
			}

			const newWords = line.words.map((originalWord) => {
				const updatedWord = updatedWordsMap.get(originalWord.id);

				if (updatedWord) {
					// biome-ignore lint/correctness/noUnusedVariables: 为了移除 type 属性
					const { type, ...word } = updatedWord;
					return word;
				} else {
					return originalWord;
				}
			});

			return {
				...line,
				startTime: updatedLine.startTime,
				endTime: updatedLine.endTime,
				words: newWords,
			};
		});

		return {
			...prev,
			lyricLines: newLines,
		};
	});
}

export function getUpdatedLineForWordPan(
	processedLine: ProcessedLyricLine,
	wordId: string,
	desiredNewStartMS: number,
	zoom: number,
): ProcessedLyricLine {
	const segmentIndex = processedLine.segments.findIndex((s) => s.id === wordId);
	if (segmentIndex === -1) return processedLine;

	const segment = processedLine.segments[segmentIndex];
	if (segment.type !== "word") return processedLine;

	const leftSegment = processedLine.segments[segmentIndex - 1] || null;
	const rightSegment = processedLine.segments[segmentIndex + 1] || null;

	const wordDurationMS = segment.endTime - segment.startTime;

	const minVisualDurationMs = (MIN_DIVIDER_WIDTH_PX / zoom) * 1000;
	const dynamicMinDurationMs = Math.max(
		MIN_WORD_DURATION_MS,
		minVisualDurationMs,
	);

	let minStartMS: number;
	if (!leftSegment) {
		minStartMS = processedLine.startTime;
	} else if (leftSegment.type === "gap") {
		minStartMS = leftSegment.startTime;
	} else {
		minStartMS = leftSegment.startTime + dynamicMinDurationMs;
	}

	let maxStartMS: number;
	if (!rightSegment) {
		maxStartMS = processedLine.endTime - wordDurationMS;
	} else if (rightSegment.type === "gap") {
		maxStartMS = rightSegment.endTime - wordDurationMS;
	} else {
		maxStartMS = rightSegment.endTime - dynamicMinDurationMs - wordDurationMS;
	}

	let newStartMS = Math.max(minStartMS, desiredNewStartMS);
	newStartMS = Math.min(maxStartMS, newStartMS);
	const newEndMS = newStartMS + wordDurationMS;

	if (Math.round(newStartMS) === Math.round(segment.startTime)) {
		return processedLine;
	}

	const newSegments = [...processedLine.segments];

	newSegments[segmentIndex] = {
		...segment,
		startTime: newStartMS,
		endTime: newEndMS,
	};

	if (leftSegment) {
		newSegments[segmentIndex - 1] = {
			...leftSegment,
			endTime: newStartMS,
		};
	}

	if (rightSegment) {
		newSegments[segmentIndex + 1] = {
			...rightSegment,
			startTime: newEndMS,
		};
	}

	return {
		...processedLine,
		segments: newSegments,
	};
}

export function getUpdatedLineForLinePan(
	processedLine: ProcessedLyricLine,
	newStartMS: number,
): ProcessedLyricLine {
	newStartMS = Math.max(0, newStartMS);

	const deltaMS = newStartMS - processedLine.startTime;

	if (Math.round(deltaMS) === 0) {
		return processedLine;
	}

	const newEndMS = processedLine.endTime + deltaMS;

	const newSegments = processedLine.segments.map((segment) => ({
		...segment,
		startTime: segment.startTime + deltaMS,
		endTime: segment.endTime + deltaMS,
	}));

	return {
		...processedLine,
		startTime: newStartMS,
		endTime: newEndMS,
		segments: newSegments,
	};
}
