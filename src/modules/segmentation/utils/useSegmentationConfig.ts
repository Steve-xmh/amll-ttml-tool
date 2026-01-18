import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import {
	segmentationCustomRulesAtom,
	segmentationIgnoreListTextAtom,
	segmentationLangAtom,
	segmentationPunctuationModeAtom,
	segmentationPunctuationWeightAtom,
	segmentationRemoveEmptySegmentsAtom,
	segmentationSplitCJKAtom,
	segmentationSplitEnglishAtom,
} from "../states";
import type { HyphenatorFunc, SegmentationConfig } from "../types";
import { loadHyphenator } from "../utils/hyphen-loader";

export const useSegmentationConfig = () => {
	const splitCJK = useAtomValue(segmentationSplitCJKAtom);
	const splitEnglish = useAtomValue(segmentationSplitEnglishAtom);
	const punctuationMode = useAtomValue(segmentationPunctuationModeAtom);
	const punctuationWeightStr = useAtomValue(segmentationPunctuationWeightAtom);
	const removeEmptySegments = useAtomValue(segmentationRemoveEmptySegmentsAtom);
	const ignoreListText = useAtomValue(segmentationIgnoreListTextAtom);
	const customRules = useAtomValue(segmentationCustomRulesAtom);
	const lang = useAtomValue(segmentationLangAtom);

	const [hyphenator, setHyphenator] = useState<HyphenatorFunc | undefined>();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const fetchHyphenator = async () => {
			if (!splitEnglish) {
				setHyphenator(undefined);
				return;
			}
			setIsLoading(true);
			const func = await loadHyphenator(lang);
			if (isMounted) {
				setHyphenator(() => func || undefined);
				setIsLoading(false);
			}
		};
		fetchHyphenator();
		return () => {
			isMounted = false;
		};
	}, [lang, splitEnglish]);

	const config = useMemo((): SegmentationConfig => {
		const weight = parseFloat(punctuationWeightStr);
		const finalPunctuationWeight = Number.isNaN(weight) ? 0.2 : weight;

		const ignoreList = new Set(
			ignoreListText.split("\n").filter((line) => line.trim() !== ""),
		);

		return {
			splitCJK,
			splitEnglish,
			punctuationMode,
			punctuationWeight: finalPunctuationWeight,
			removeEmptySegments,
			ignoreList,
			customRules,
			hyphenator,
		};
	}, [
		splitCJK,
		splitEnglish,
		punctuationMode,
		punctuationWeightStr,
		removeEmptySegments,
		ignoreListText,
		customRules,
		hyphenator,
	]);

	return {
		config,
		isLoading,
	};
};
