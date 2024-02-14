<!--
  - Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
  -
  - 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
  - This source code file is a part of AMLL TTML Tool project.
  - 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
  - Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
  -
  - https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
  -->

<template>
	<NModal :segmented="{ footer: 'soft' }" :show="dialogs.concatWords"
			:title="t('concatWordModal.title')" preset="card" style="max-width: 600px;"
			transform-origin="center"
			@close="dialogs.concatWords = false">
		<NAlert style="margin-bottom: 1em" type="info">
			<i18n-t keypath="concatWordModal.tip"/>
		</NAlert>
		<NSpace style="margin-bottom: 1em" vertical>
			<div>
				<i18n-t keypath="concatWordModal.originPreview"/>
			</div>
			<div class="word-preview">
				<span v-for="(word, i) in originPreview"
					  :class="{ 'merge-word': i >= mergeRangeMin && i <= mergeRangeMax }">
					{{ word }}
				</span>
			</div>
		</NSpace>
		<NFormItem :label="t('concatWordModal.mergeRange')">
			<NSlider v-model:value="mergeRange" :format-tooltip="(v: number) => `${v + 1}`"
					 :max="originPreview.length - 1" :min="0" :step="1"
					 range/>
		</NFormItem>
		<NFormItem :label="t('concatWordModal.emptyBeatMergeMethod.label')">
			<NSelect v-model:value="emptyBeatMergeMethod" :options="emptyBeatMergeOptions"/>
		</NFormItem>
		<NSpace vertical>
			<div>
				<i18n-t keypath="concatWordModal.concatResultPreview"/>
			</div>
			<div class="word-preview">
				<span v-for="(word, i) in concatPreview"
					  :class="{ 'merge-word': i === mergeRangeMin }">
					{{ word }}
				</span>
			</div>
		</NSpace>
		<template #footer>
			<NButton
				type="primary"
				@click="processWordConcat"
			>
				<i18n-t keypath="concatWordModal.concatBtn"/>
			</NButton>
		</template>
	</NModal>
</template>

<script lang="ts" setup>
import {NAlert, NButton, NFormItem, NModal, NSelect, NSlider, NSpace, type SelectOption} from 'naive-ui';
import {useDialogs, useEditingLyric, useRightClickLyricLine} from '../../store';
import {computed, ref, toRaw} from "vue";
import {useI18n} from "vue-i18n";
import type {LyricWord} from "../../utils/ttml-types";
import structuredClone from "@ungap/structured-clone";

const lyric = useEditingLyric();
const rightClick = useRightClickLyricLine();
const dialogs = useDialogs();
const mergeRange = ref([0, 0]);
const emptyBeatMergeMethod = ref("accumulate-word-beat");
const {t} = useI18n({useScope: "global"});

const emptyBeatMergeOptions: SelectOption[] = [
	{label: t("concatWordModal.emptyBeatMergeMethod.accumulateWordBeat"), value: "accumulate-word-beat"},
	{label: t("concatWordModal.emptyBeatMergeMethod.accumulateBeat"), value: "accumulate-beat"},
	{label: t("concatWordModal.emptyBeatMergeMethod.accumulateWord"), value: "accumulate-word"},
	{label: t("concatWordModal.emptyBeatMergeMethod.clear"), value: "clear"},
];

const mergeRangeMin = computed(() => Math.min(...mergeRange.value));
const mergeRangeMax = computed(() => Math.max(...mergeRange.value));
const originPreview = computed(() => lyric.lyrics[rightClick.selectedLine]?.words?.map(word => word.word) ?? []);
const concatPreview = computed(() => {
	const origin = [...originPreview.value];
	const joined = origin.slice(mergeRangeMin.value, mergeRangeMax.value + 1).join("");
	origin.splice(mergeRangeMin.value, mergeRangeMax.value - mergeRangeMin.value + 1, joined);
	return origin;
});

function processWordConcat() {
	const line = lyric.lyrics[rightClick.selectedLine];
	if (line) {
		const min = mergeRangeMin.value;
		const max = mergeRangeMax.value;
		const concatWords = line.words.slice(min, max + 1);
		if (concatWords.length > 1) {
			const startTime = concatWords[0].startTime;
			const endTime = concatWords[concatWords.length - 1].endTime;
			const newWord: LyricWord = {
				word: concatWords.map(w => w.word).join(""),
				startTime,
				endTime,
			};
			switch (emptyBeatMergeMethod.value) {
				case "accumulate-word":
					newWord.emptyBeat = concatWords.length - 1;
					break;
				case "accumulate-beat":
					newWord.emptyBeat = concatWords.reduce((acc, cur) => acc + (cur.emptyBeat ?? 0), 0);
					break;
				case "accumulate-word-beat":
					newWord.emptyBeat = concatWords.length - 1 + concatWords.reduce((acc, cur) => acc + (cur.emptyBeat ?? 0), 0);
					break;
				default:
			}
			const words = (window.structuredClone || structuredClone)(toRaw(line.words));
			words.splice(min, max - min + 1, newWord);
			line.words = words;
			lyric.record();
		}
	}

	dialogs.concatWords = false;
}

</script>

<style lang="sass" scoped>
.word-preview
	max-width: 100%
	overflow: auto hidden
	display: flex
	gap: 1em
	white-space: nowrap

	> *
		border: solid 1px #9993
		border-radius: 4px
		padding: 0 0.5em

.merge-word
	background-color: #0914
	border: solid 1px #4A4A
</style>
