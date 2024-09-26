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
	<NModal :segmented="{ footer: 'soft' }" :show="dialogs.splitWord" preset="card" style="max-width: 600px;"
		transform-origin="center" :title="t('splitWordModal.title')" @close="dialogs.splitWord = false">
		<NAlert style="margin-bottom: 1em" type="info">
			<i18n-t keypath="splitWordModal.tip" />
		</NAlert>
		<NFormItem :label="t('splitWordModal.originalWord')">
			<NInput v-model:value="splitWord" />
		</NFormItem>
		<NFormItem :label="t('splitWordModal.delimiter')">
			<NInput v-model:value="splitDelimiter" />
		</NFormItem>
		<NSpace vertical>
			<div>
				<i18n-t keypath="splitWordModal.splitResultPreview" />
			</div>
			<div class="result-preview">
				<span v-for="word in splitResult">
					{{ word }}
				</span>
			</div>
		</NSpace>
		<template #footer>
			<NButton type="primary" @click="processWordSplit">
				<i18n-t keypath="splitWordModal.splitBtn" />
			</NButton>
		</template>
	</NModal>
</template>

<script setup lang="ts">
import { NAlert, NButton, NFormItem, NInput, NModal, NSpace } from "naive-ui";
import {
	useDialogs,
	useEditingLyric,
	useRightClickLyricLine,
} from "../../store";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import type { LyricWord } from "../../utils/ttml-types";

const lyric = useEditingLyric();
const rightClick = useRightClickLyricLine();
const dialogs = useDialogs();
const splitWord = ref("");
const splitDelimiter = ref("\\");
const { t } = useI18n({ useScope: "global" });

const originWord = computed(
	() =>
		lyric.lyrics[rightClick.selectedLine]?.words?.[rightClick.selectedWord]
			?.word ?? "",
);
const splitResult = computed(() => {
	const word = splitWord.value;
	const delimiter = splitDelimiter.value;
	if (word && delimiter) {
		return word.split(delimiter);
	}
	return [word];
});

function processWordSplit() {
	const line = lyric.lyrics[rightClick.selectedLine];
	if (line) {
		const joinResult = splitResult.value.join("");
		const newWords: LyricWord[] = splitResult.value.map((word) => ({
			word,
			startTime: 0,
			endTime: 0,
		}));
		const startTime = line.words[rightClick.selectedWord]?.startTime ?? 0;
		const endTime = line.words[rightClick.selectedWord]?.endTime ?? 0;
		const timeStep = (endTime - startTime) / joinResult.length;
		let wordIndex = 0;
		for (const newWord of newWords) {
			newWord.startTime = startTime + timeStep * wordIndex;
			newWord.endTime =
				startTime + timeStep * (wordIndex + newWord.word.length);
			wordIndex += newWord.word.length;
		}
		line.words.splice(rightClick.selectedWord, 1, ...newWords);
		lyric.record();
	}
	dialogs.splitWord = false;
}

watchEffect(() => {
	splitWord.value = originWord.value;
});
</script>

<style lang="css" scoped>
.result-preview {
	max-width: 100%;
	overflow: auto hidden;
	display: flex;
	gap: 1em;
	white-space: nowrap;

	>* {
		border: solid 1px #9993;
		border-radius: 4px;
		padding: 0 0.5em;
	}
}
</style>
