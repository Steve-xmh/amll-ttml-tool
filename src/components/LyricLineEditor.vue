<template>
    <div style="display: flex; align-items: center; gap: 12px" @contextmenu.prevent="
        lyricMenu.showMenuForLyric(
            props.index,
            -1,
            $event.clientX,
            $event.clientY
        )
        ">
        <NCheckbox />
        <div v-if="editState.showWords" style="display: flex; flex: 1; gap: 8px; flex-wrap: wrap">
            <LyricWordEditor v-for="(word, i) in lyric.lyrics[props.index].words" :key="i" :line-index="props.index"
                :word="word.word" :word-index="i" />
            <NInput round autosize autofocus ref="inputRef" placeholder="新单词" :value="editState.newWord"
                @input="editState.newWord = $event" @change="onAddNewWord" style="min-width: 100px" />
        </div>
        <div v-else style="flex: 1">
            <span v-for="(word, i) in lyric.lyrics[props.index].words" :key="i">{{
                word.word
            }}</span>
        </div>
        <NButton quaternary size="tiny" circle style="margin-left: 4px">
            <NIcon>
                <Dismiss12Filled />
            </NIcon>
        </NButton>
    </div>
</template>

<script setup lang="tsx">
import { NInput, NCheckbox, NButton, NIcon, type InputInst } from "naive-ui";
import { useEditingLyric, useRightClickLyricLine } from "../store";
import { nextTick, onMounted, reactive, ref } from "vue";
import { Dismiss12Filled } from "@vicons/fluent";
import LyricWordEditor from "./LyricWordEditor.vue";

const props = defineProps<{
    index: number;
}>();
const lyric = useEditingLyric();
const lyricMenu = useRightClickLyricLine();
const editState = reactive({ newWord: "", showWords: false });
const inputRef = ref<InputInst | null>(null);

function onAddNewWord() {
    lyric.addNewWord(props.index, editState.newWord);
    editState.newWord = "";
}

onMounted(() => {
    nextTick(() => inputRef.value?.focus());
});
</script>
