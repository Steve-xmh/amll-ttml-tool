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
    <input v-if="edit.enable" class="word" ref="inputRef" :value="edit.value"
        @input="edit.value = ($event.target as HTMLInputElement).value" @change="onFinishEditWord"
        @blur="onFinishEditWord" />
    <button v-else :class="{
        word: true,
        'white-space': isWhiteSpace,
    }" @click="onEditWord" @contextmenu.stop.prevent="
    showMenuForLyric(
        props.lineIndex,
        props.wordIndex,
        $event.clientX,
        $event.clientY
    )
    ">
        {{ displayWord }}
    </button>
</template>

<script setup lang="tsx">
import { NButton, NIcon, NInput, type InputInst } from "naive-ui";
import { Dismiss12Filled } from "@vicons/fluent";
import { useEditingLyric, useRightClickLyricLine } from "../store";
import { nextTick, reactive, ref, computed } from "vue";
import { i18n } from '../i18n';

const inputRef = ref<InputInst | null>(null);
const props = defineProps<{
    lineIndex: number;
    wordIndex: number;
    word: string;
}>();
const { modifyWord, removeWord } = useEditingLyric();
const { showMenuForLyric } = useRightClickLyricLine();

const isWhiteSpace = computed(() =>
    props.word.trim().length === 0
);
const displayWord = computed(() => {
    if (props.word.length === 0) {
        return i18n.global.t("lyricWordEditor.empty");
    } else if (props.word.trim().length === 0) {
        return i18n.global.t("lyricWordEditor.space", [props.word.length]);
    } else {
        return props.word;
    }
});

const edit = reactive({
    enable: false,
    value: "",
});

function onEditWord() {
    edit.enable = true;
    edit.value = props.word;
    nextTick(() => inputRef.value?.focus());
}

function onFinishEditWord() {
    edit.enable = false;
    if (edit.value !== props.word)
        modifyWord(props.lineIndex, props.wordIndex, edit.value);
}

function onDeleteWord() {
    removeWord(props.lineIndex, props.wordIndex);
}
</script>

<style lang="sass">
.word
    margin-right: 8px
    padding: 4px 12px
    border: 1px solid var(--att-border-color)
    color: var(--n-text-color)
    cursor: pointer
    white-space: pre-wrap
    background: transparent
    border-radius: calc(var(--att-height-medium) / 2)
    height: var(--att-height-medium)
    &.white-space
        opacity: 0.5
input.word
    cursor: unset
button.word:hover
    border: 1px solid var(--att-theme-color)
</style>
