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
)
const displayWord = computed(() => {
    if (props.word.length === 0) {
        return "空白"
    } else if (props.word.trim().length === 0) {
        return "空格x" + props.word.length
    } else {
        return props.word
    }
})

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
