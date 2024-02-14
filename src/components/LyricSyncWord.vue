<!--
  - Copyright 2023-2024 Steve Xiao (stevexmh@qq.com) and contributors.
  -
  - 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
  - This source code file is a part of AMLL TTML Tool project.
  - 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
  - Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
  -
  - https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
  -->

<template>
	<div v-show="props.word.word.trim().length > 0" ref="elRef" :class="{
        'lyric-word-not-main': props.notMain,
        'lyric-word-warn': hasError,
    }" @click="currentWord.wordIndex = props.word.id; currentWord.emptyBeat = 0;">
		<div v-if="displayWord.htmlWord" v-html="displayWord.htmlWord"></div>
		<div v-else>{{ displayWord.word }}</div>
		<div>{{ toTimestamp(props.word.startTime ?? 0) }}</div>
		<div>{{ toTimestamp(props.word.endTime ?? 0) }}</div>
		<div v-if="props.word.id === currentWord.wordIndex && !props.notMain">{{ toTimestamp(currentTimeMS) }}</div>
		<div v-if="props.word.id === currentWord.wordIndex && !props.notMain"/>
		<div v-if="props.word.id === currentWord.wordIndex && !props.notMain && (props.word.emptyBeat ?? 0) > 0">
			{{ currentWord.emptyBeat }} / {{ props.word.emptyBeat }}
		</div>
	</div>
</template>

<script lang="ts" setup>
import {useAudio, useCurrentSyncWord, useSettings} from "../store";
import {computed, nextTick, onMounted, reactive, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import type {LyricWordWithId} from "../store/lyric";

const currentWord = useCurrentSyncWord();
const audio = useAudio();
const settings = useSettings();
const {currentTimeMS} = storeToRefs(audio);

const props = defineProps<{
	word: LyricWordWithId;
	notMain?: boolean;
}>();

const displayWord = reactive({
	word: props.word.word,
	htmlWord: "",
});

const elRef = ref<HTMLDivElement>();
const lastWordIndex = ref(currentWord.wordIndex)
watch(() => [currentWord.wordIndex, props.word.id, props.word.lineIndex], () => {
	if (!props.notMain && currentWord.wordIndex === props.word.id) {
		nextTick(() => {
			elRef.value?.scrollIntoView({
				behavior: Math.abs(currentWord.wordIndex - lastWordIndex.value) <= 1 ? "smooth" : "instant",
				block: "center",
				inline: "center"
			});
		})
		lastWordIndex.value = currentWord.wordIndex
	}
}, {flush: "post"})

const hasError = computed(() => {
	return props.word.endTime - props.word.startTime < 0;
});

watch(() => [props.word, settings.showJpnRomaji], async () => {
	displayWord.word = props.word.word;
	displayWord.htmlWord = "";
	if (settings.showJpnRomaji) {
		const {kuroshiro} = await import("../utils/kuroshiro-analyzer-kuromoji-fix-dict");
		displayWord.htmlWord = await kuroshiro.convert(displayWord.word, {to: 'romaji', mode: "furigana"})
	}
}, {flush: "post"});

onMounted(async () => {
	if (settings.showJpnRomaji) {
		const {kuroshiro} = await import("../utils/kuroshiro-analyzer-kuromoji-fix-dict");
		displayWord.htmlWord = await kuroshiro.convert(displayWord.word, {to: 'romaji', mode: "furigana"})
	}
})

function toTimestamp(duration: number) {
	const isRemainTime = duration < 0;

	const d = Math.abs(duration / 1000);
	const sec = d % 60;
	const min = Math.floor((d - sec) / 60);
	const secFixed = sec.toFixed(3);
	const secText = "0".repeat(6 - secFixed.length) + secFixed;

	return `${isRemainTime ? "-" : ""}${min}:${secText}`;
}

</script>

<style lang="sass">
.lyric-word-warn
	color: #EE4444

.lyric-word-not-main
	opacity: 0.5
</style>
