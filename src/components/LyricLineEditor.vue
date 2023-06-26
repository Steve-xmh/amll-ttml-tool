<template>
    <div class="line" style="display: flex; align-items: center; gap: 12px" @contextmenu.prevent="
        lyricMenu.showMenuForLyric(
            props.index,
            -1,
            $event.clientX,
            $event.clientY
        )
        ">
        <NCheckbox :checked="lyric.lyrics[props.index].selected" @click="
            lyric.lyrics[props.index].selected = !lyric.lyrics[props.index].selected
            " />
        <div style="display: flex; flex: 1; gap: 8px; flex-direction: column">
            <div style="display: flex; flex: 1; gap: 8px; flex-wrap: wrap">
                <LyricWordEditor v-for="(word, i) in lyric.lyrics[props.index].words" :key="i" :line-index="props.index"
                    :word="word.word" :word-index="i" />
                <NInput class="new-word" round autosize ref="inputRef" placeholder="新单词" :value="editState.newWord"
                    @input="editState.newWord = $event" @change="onAddNewWord" style="min-width: 100px" />
            </div>
            <div v-show="settings.showTranslateLine">
                <NInput round placeholder="翻译歌词" :value="editState.translateLine" @input="editState.translateLine = $event"
                    @change="lyric.modifyTranslatedLine(props.index, editState.translateLine)" style="min-width: 100px" />
            </div>
            <div v-show="settings.showRomanLine">
                <NInput round placeholder="音译歌词" :value="editState.romanLine" @input="editState.romanLine = $event"
                    @change="lyric.modifyRomanLine(props.index, editState.romanLine)" style="min-width: 100px" />
            </div>
        </div>
        <NButton quaternary size="tiny" circle style="margin-left: 4px" @click="lyric.removeLine(props.index)">
            <NIcon>
                <Dismiss12Filled />
            </NIcon>
        </NButton>
    </div>
</template>

<script setup lang="tsx">
import { NInput, NCheckbox, NButton, NIcon, type InputInst } from "naive-ui";
import { useEditingLyric, useRightClickLyricLine, useSettings } from "../store";
import { nextTick, onMounted, reactive, ref } from "vue";
import { Dismiss12Filled } from "@vicons/fluent";
import LyricWordEditor from "./LyricWordEditor.vue";

const props = defineProps<{
    index: number;
}>();
const lyric = useEditingLyric();
const lyricMenu = useRightClickLyricLine();
const editState = reactive({
    newWord: "",
    translateLine: lyric.lyrics[props.index].translatedLyric,
    romanLine: lyric.lyrics[props.index].romanLyric,
});
const settings = useSettings();
const inputRef = ref<InputInst | null>(null);

lyric.$subscribe(() => {
    editState.translateLine = lyric.lyrics[props.index].translatedLyric;
    editState.romanLine = lyric.lyrics[props.index].romanLyric;
}, {
    flush: "post",
});

function onAddNewWord() {
    lyric.addNewWord(props.index, editState.newWord);
    editState.newWord = "";
}

onMounted(() => {
    nextTick(() => inputRef.value?.focus());
});
</script>

<style lang="sass" scoped>
.new-word
    opacity: 0
    transition: opacity 0.2s
    &:has(:focus)
        opacity: 1
.line:hover .new-word
    opacity: 1
</style>
