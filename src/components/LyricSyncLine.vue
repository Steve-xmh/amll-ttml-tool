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
	<div ref="itemRef" :class="{
		'lyric-line-item': true,
		'lyric-line-item-selected': currentWord.lineIndex === props.line.id,
	}" @click="
		currentWord.lineIndex = props.line.id;
	currentWord.wordIndex = 0;
	currentWord.emptyBeat = 0;
	">
		<div class="lyric-line-item-inner">
			<div>{{ toTimestamp(line.startTime ?? 0) }}</div>
			<div v-if="line.words.length > 0" class="word-time">{{ toTimestamp(line.words[0].startTime ?? 0) }}</div>
			<div class="line">
				<div :class="{
					'hot-line':
						line.words.length > 0 &&
						line.words[0].startTime <= currentTime &&
						line.words[line.words.length - 1].endTime > currentTime,
				}">
					<span v-for="word in line.words" :key="word.id" :class="{
						'current-word':
							word.lineIndex === currentWord.lineIndex &&
							word.id === currentWord.wordIndex,
						'hot-word':
							word.startTime <= currentTime && word.endTime > currentTime,
						'lyric-line-word-warn': word.endTime - word.startTime < 0,
					}">{{ word.word }}</span>
				</div>
				<div v-if="settings.showTranslateLine">{{ line.translatedLyric }}</div>
				<div v-if="settings.showRomanLine">{{ line.romanLyric }}</div>
			</div>
			<div v-if="line.words.length > 0" class="word-time">{{
				toTimestamp(line.words[line.words.length - 1].endTime ?? 0)
			}}
			</div>
			<div>{{ toTimestamp(line.endTime ?? 0) }}</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { nextTick, ref, watch } from "vue";
import { useAudio, useCurrentSyncWord, useSettings } from "../store";
import type { LyricLineWithId } from "../store/lyric";

const itemRef = ref<HTMLDivElement>();

const { currentTime } = storeToRefs(useAudio());
const currentWord = useCurrentSyncWord();
const settings = useSettings();

const props = defineProps<{
	line: LyricLineWithId;
}>();

watch(
	() => [currentWord.lineIndex, props.line.id],
	() => {
		if (currentWord.lineIndex === props.line.id) {
			nextTick(() => {
				itemRef.value?.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "center",
				});
			});
		}
	},
	{ flush: "post" },
);

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

<style lang="css" scoped>
.sync-line>* {
	margin-right: 6px;
}

.lyric-line-word-warn {
	color: #EE4444;
}

.lyric-line-item {
	cursor: pointer;
	outline-offset: -4px;
	padding: 4px;
	border-bottom: 1px solid rgba(170, 170, 170, 0.2666666667);

	&.lyric-line-item-selected {
		outline: 3px solid var(--att-theme-color);
	}

	&:hover {
		background: var(--att-color-hover);
		color: var(--att-text-color-hover);
	}
}

.hot-line {
	color: var(--att-theme-color-hover);
	opacity: 0.7;
}

.hot-word {
	color: var(--att-theme-color-pressed);
}

.current-word {
	color: var(--att-theme-color);
	font-weight: bold;
}

.lyric-line-item-inner {
	display: flex;
	align-items: center;
	margin: 0 12px;
	gap: 12px;

	.word-time {
		opacity: 0.75;
	}

	.line {
		font-size: 18px;
		flex: 1;
	}
}
</style>
