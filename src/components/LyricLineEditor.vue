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
	<div class="line" style="display: flex; align-items: center; gap: 12px" @contextmenu.prevent="
		lyricMenu.showMenuForLyric(
			props.line.id,
			-1,
			$event.clientX,
			$event.clientY
		)
		">
		<NCheckbox :checked="props.line.selected" @click="
			lyric.lyrics[props.line.id].selected = !lyric.lyrics[props.line.id].selected
			" />
		<div style="min-width: 3em; text-align: right">
			{{ props.line.id + 1 }}
		</div>
		<div style="display: flex; flex: 1; gap: 8px; flex-direction: column; min-width: 0; overflow: hidden;">
			<div
				:style="settings.uiLayoutMode === UILayoutMode.Advanced ? 'overflow-x: auto; white-space: nowrap;' : 'display: flex; flex: direction: row; align-items: center;'">
				<Draggable :list="props.line.words" :style="{
					whiteSpace: settings.uiLayoutMode === UILayoutMode.Advanced && 'nowrap'
				}" item-key="id" @sort="onSort">
					<template #item="{ element }">
						<LyricWordEditor :line-index="element.lineIndex" :word="element" :word-index="element.id" />
					</template>
				</Draggable>
				<NInput v-if="settings.uiLayoutMode === UILayoutMode.Simple" ref="inputRef"
					:placeholder="t('lyricLineEditor.newWordPlaceholder')" :value="editState.newWord" autosize round
					style="min-width: 100px;" @change="onAddNewWord" @input="editState.newWord = $event" />
			</div>
			<div v-if="settings.showTranslateLine">
				<NInput :placeholder="t('lyricLineEditor.translateLinePlaceholder')" :value="editState.translateLine"
					round style="min-width: 100px"
					@change="lyric.modifyTranslatedLine(props.line.id, editState.translateLine)"
					@input="editState.translateLine = $event" />
			</div>
			<div v-if="settings.showRomanLine">
				<NInput :placeholder="t('lyricLineEditor.romanLinePlaceholder')" :value="editState.romanLine" round
					style="min-width: 100px" @change="lyric.modifyRomanLine(props.line.id, editState.romanLine)"
					@input="editState.romanLine = $event" />
			</div>
		</div>
		<div>
			<NIcon v-if="props.line.isBG" color="#1166FF" size="24">
				<VideoBackgroundEffect24Filled />
			</NIcon>
			<NIcon v-if="props.line.isDuet" color="#63e2b7" size="24">
				<TextAlignRight24Filled />
			</NIcon>
		</div>
		<div style="display: flex; flex-direction: column;">
			<NButton v-if="settings.uiLayoutMode === UILayoutMode.Advanced" circle quaternary style="margin-left: 4px"
				@click="lyric.addNewWord(props.line.id, '')">
				<NIcon size="24">
					<Add24Filled />
				</NIcon>
			</NButton>
			<NButton circle quaternary style="margin-left: 4px" @click="lyric.removeLine(props.line.id)">
				<NIcon size="24">
					<Delete24Regular />
				</NIcon>
			</NButton>
		</div>
	</div>
</template>

<script setup lang="tsx">
import {
	Add24Filled,
	Delete24Regular,
	TextAlignRight24Filled,
	VideoBackgroundEffect24Filled,
} from "@vicons/fluent";
import { type InputInst, NButton, NCheckbox, NIcon, NInput } from "naive-ui";
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Draggable from "vuedraggable";
import {
	UILayoutMode,
	useEditingLyric,
	useRightClickLyricLine,
	useSettings,
} from "../store";
import type { LyricLineWithId } from "../store/lyric";
import LyricWordEditor from "./LyricWordEditor.vue";

const props = defineProps<{
	line: LyricLineWithId;
}>();
const lyric = useEditingLyric();
const lyricMenu = useRightClickLyricLine();
const editState = reactive({
	newWord: "",
	translateLine: props.line.translatedLyric,
	romanLine: props.line.romanLyric,
});
const settings = useSettings();
const { t } = useI18n({ useScope: "global" });
const inputRef = ref<InputInst | null>(null);

function onSort(
	e: CustomEvent & {
		oldIndex: number;
		newIndex: number;
	},
) {
	lyric.reorderWord(props.line.id, e.oldIndex, e.newIndex);
}

watch(
	() => props.line,
	() => {
		editState.translateLine = props.line.translatedLyric;
		editState.romanLine = props.line.romanLyric;
	},
	{
		flush: "post",
	},
);

function onAddNewWord() {
	lyric.addNewWord(props.line.id, editState.newWord);
	editState.newWord = "";
}
</script>

<style lang="css" scoped>
.line:hover .new-word {
	opacity: 1;
}
</style>
