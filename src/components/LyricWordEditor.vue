<template>
    <NInput ref="inputRef" v-if="edit.enable" :value="edit.value" @input="edit.value = $event" @change="onFinishEditWord"
        @blur="onFinishEditWord" round autofocus autosize style="min-width: 100px" />
    <NButton v-else round style="margin-right: 8px; padding-right: 8px" @click="onEditWord">
        {{ props.word.trim() }}
        <span v-if="props.word.length === 0" style="opacity: 0.5"> 空白 </span>
        <span v-else-if="props.word.trim().length === 0" style="opacity: 0.5">
            空格x{{ props.word.length }}
        </span>
        <NButton quaternary size="tiny" circle style="margin-left: 4px" @click.stop="onDeleteWord">
            <NIcon>
                <Dismiss12Filled />
            </NIcon>
        </NButton>
    </NButton>
</template>

<script setup lang="tsx">
import { NButton, NIcon, NInput, type InputInst } from "naive-ui";
import { Dismiss12Filled } from "@vicons/fluent";
import { useEditingLyric } from "../store";
import { nextTick, reactive, ref } from "vue";

const inputRef = ref<InputInst | null>(null);
const props = defineProps<{
    lineIndex: number;
    wordIndex: number;
    word: string;
}>();
const lyric = useEditingLyric();
const word = lyric.lyrics[props.lineIndex].words[props.wordIndex] ?? {
    word: "",
    time: 0,
};
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
        lyric.modifyWord(props.lineIndex, props.wordIndex, edit.value);
}

function onDeleteWord() {
    lyric.removeWord(props.lineIndex, props.wordIndex);
}
</script>
