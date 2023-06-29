<template>
    <NInput ref="inputRef" v-if="edit.enable" :value="edit.value" @input="edit.value = $event" @change="onFinishEditWord"
        @blur="onFinishEditWord" round autosize style="min-width: 100px" />
    <NButton v-else round style="margin-right: 8px; padding-right: 8px" @click="onEditWord">
        {{ displayWord }}
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
import { nextTick, reactive, ref, computed } from "vue";

const inputRef = ref<InputInst | null>(null);
const props = defineProps<{
    lineIndex: number;
    wordIndex: number;
    word: string;
}>();
const { modifyWord, removeWord } = useEditingLyric();

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
