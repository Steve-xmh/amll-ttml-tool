import { lyricLinesAtom } from "$/states/main";
import { globalStore } from "$/states/store.ts";
import type {
	ProcessedLyricLine,
	WordSegment,
} from "$/utils/segment-processing.ts";

const MIN_DURATION_MS = 1;
const MIN_DIVIDER_WIDTH_PX = 15;

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
	const dynamicMinDurationMs = Math.max(MIN_DURATION_MS, minVisualDurationMs);

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
