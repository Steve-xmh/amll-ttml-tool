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
	<span style="display: inline-block; margin-right: 8px;">
		<template v-if="settings.uiLayoutMode === UILayoutMode.Advanced">
			<TimeStampInput :value="props.word.startTime" style="background-color: #11FF5522;"
				@update:model-value="onEditWordStartTime" />
			<div
				style="text-align: center; display: flex; flex-direction: row; align-items: center; justify-content: space-between; margin: 4px 0;">
				<div>
					<NButton circle quaternary
						@click="() => { rightClick.selectedLine = props.lineIndex; rightClick.selectedWord = props.wordIndex; dialogs.splitWord = true; }">
						<template #icon>
							<NIcon size="20">
								<Cut20Filled />
							</NIcon>
						</template>
					</NButton>
				</div>
				<div :class="{
					'white-space': isWhiteSpace,
				}" style="padding: 0.25em;">
					<template v-if="edit.enable">
						<input v-if="edit.enable" ref="inputRef" :value="edit.value" class="word-advanced"
							@blur="onFinishEditWord" @change="onFinishEditWord"
							@input="edit.value = ($event.target as HTMLInputElement).value" />
					</template>
					<span v-else class="word-preview-advanced" @click="onEditWord">
						{{ displayWord }}
					</span>
				</div>
				<div>
					<NButton circle quaternary @click="onDeleteWord">
						<template #icon>
							<NIcon size="20">
								<Delete20Regular />
							</NIcon>
						</template>
					</NButton>
				</div>
			</div>
			<TimeStampInput :value="props.word.endTime" style="background-color: #FF112222;"
				@update:model-value="onEditWordEndTime" />
			<div class="word-edit">
				<div>
					<NIcon size="20">
						<Drum />
					</NIcon>
				</div>
				<NInputNumber :min="0" :step="1" :value="props.word.emptyBeat" placeholder="0" size="small"
					style="max-width: 7em" @update:value="onEditEmptyBeat" />
			</div>
		</template>
		<div v-else>
			<input v-if="edit.enable" ref="inputRef" :value="edit.value" class="word" @blur="onFinishEditWord"
				@change="onFinishEditWord" @input="edit.value = ($event.target as HTMLInputElement).value" />
			<button v-else :class="{
				word: true,
				'white-space': isWhiteSpace,
			}" @click="onEditWord" @contextmenu.stop.prevent="
				rightClick.showMenuForLyric(
					props.lineIndex,
					props.wordIndex,
					$event.clientX,
					$event.clientY
				)
				">
				{{ displayWord }}
				<NTag v-if="!!props.word.emptyBeat" class="empty-beat" size="tiny">
					{{ props.word.emptyBeat }}
				</NTag>
			</button>
		</div>
	</span>
</template>

<script setup lang="ts">
import { Drum } from "@vicons/fa";
import { Cut20Filled, Delete20Regular } from "@vicons/fluent";
import { type InputInst, NButton, NIcon, NInputNumber, NTag } from "naive-ui";
import { computed, nextTick, reactive, ref } from "vue";
import { i18n } from "../i18n";
import {
	UILayoutMode,
	useDialogs,
	useEditingLyric,
	useRightClickLyricLine,
	useSettings,
} from "../store";
import type { LyricWord } from "../utils/ttml-types";
import TimeStampInput from "./TimeStampInput.vue";

const inputRef = ref<InputInst | null>(null);
const props = defineProps<{
	lineIndex: number;
	wordIndex: number;
	word: LyricWord;
}>();
const dialogs = useDialogs();
const {
	modifyWord,
	removeWord,
	setWordTimeNoLast,
	setWordEndTime,
	modifyWordEmptyBeat,
} = useEditingLyric();
const rightClick = useRightClickLyricLine();
const settings = useSettings();

const isWhiteSpace = computed(() => props.word.word.trim().length === 0);
const displayWord = computed(() => {
	if (props.word.word.length === 0) {
		return i18n.global.t("lyricWordEditor.empty");
	} else if (props.word.word.trim().length === 0) {
		return i18n.global.t("lyricWordEditor.space", [props.word.word.length]);
	} else {
		return props.word.word;
	}
});

const edit = reactive({
	enable: false,
	value: "",
});

function onEditWord() {
	edit.enable = true;
	edit.value = props.word.word;
	nextTick(() => inputRef.value?.focus());
}

function onFinishEditWord() {
	edit.enable = false;
	if (edit.value !== props.word.word)
		modifyWord(props.lineIndex, props.wordIndex, edit.value);
}

function onDeleteWord() {
	removeWord(props.lineIndex, props.wordIndex);
}

function onEditWordStartTime(time: number) {
	setWordTimeNoLast(props.lineIndex, props.wordIndex, time);
}

function onEditWordEndTime(time: number) {
	setWordEndTime(props.lineIndex, props.wordIndex, time);
}

function onEditEmptyBeat(value: number) {
	modifyWordEmptyBeat(props.lineIndex, props.wordIndex, value);
}
</script>

<style lang="css" scoped>
.word {
	margin-right: 8px;
	padding: 4px 12px;
	border: 1px solid var(--att-border-color);
	color: var(--n-text-color);
	cursor: pointer;
	background: transparent;
	border-radius: calc(var(--att-height-medium) / 2);
	height: var(--att-height-medium);
}

.word-preview-advanced {
	flex: 1;
	border-radius: calc(var(--att-height-medium) / 8);
	padding: 0.25em 0.5em;

	&:hover {
		background: var(--att-theme-color);
		color: var(--n-foreground-color);
		height: 100%;
	}
}

.word-advanced {
	margin-right: 8px;
	padding: 4px 12px;
	border: 1px solid var(--att-border-color);
	border-radius: calc(var(--att-height-medium) / 8);
	color: var(--n-text-color);
	cursor: text;
	background: transparent;
	min-width: 0;
	flex: 1;
	height: 100%;
}

.white-space {
	opacity: 0.5;
}

input.word {
	cursor: unset;
}

button.word:hover {
	border: 1px solid var(--att-theme-color);
}

.word-edit {
	width: 100%;
	display: grid;
	padding: 0 1em;
	padding-top: 0.5em;
	grid-template-columns: auto auto;
	gap: 8px;
	align-items: center;

	>*:nth-child(2n) {
		justify-self: flex-end;
		min-width: 4em;
	}
}
</style>
