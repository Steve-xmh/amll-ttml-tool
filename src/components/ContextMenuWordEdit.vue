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
	<div class="context-menu-word-edit">
		<div>内容</div>
		<NInput v-model:value="wordEdit.word" placeholder="" size="small" @blur="onContentBlur"/>
		<div>空拍</div>
		<NInputNumber v-model:value="wordEdit.emptyBeat" :min="0"
					  :step="1" placeholder="0" size="small" style="max-width: 7em" @blur="onEmptyBeatBlur"/>
	</div>
</template>

<script setup lang="ts">

import {NInput, NInputNumber, useNotification} from "naive-ui";
import {useEditingLyric, useRightClickLyricLine} from "../store";
import {onMounted, reactive} from "vue";
import type {LyricWord} from "../utils/ttml-types";

const lyricLineMenu = useRightClickLyricLine();
const notify = useNotification();
const lyric = useEditingLyric();

const wordEdit = reactive({
	word: "",
	emptyBeat: 0,
})

onMounted(() => {
	const selectedWord: LyricWord | undefined = lyric.lyrics[lyricLineMenu.selectedLine]?.words?.[lyricLineMenu.selectedWord];

	wordEdit.word = selectedWord?.word ?? "";
	wordEdit.emptyBeat = selectedWord?.emptyBeat ?? 0;
})

function onEmptyBeatBlur() {
	lyric.modifyWordEmptyBeat(lyricLineMenu.selectedLine, lyricLineMenu.selectedWord, wordEdit.emptyBeat);
}

function onContentBlur() {
	lyric.modifyWord(lyricLineMenu.selectedLine, lyricLineMenu.selectedWord, wordEdit.word);
}

</script>

<style scoped lang="sass">
.context-menu-word-edit
	width: 100%
	display: grid
	padding: 0 1em
	padding-top: 0.5em
	grid-template-columns: auto auto
	gap: 8px
	align-items: center

	> *:nth-child(2n)
		justify-self: flex-end
</style>

