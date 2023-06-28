<template>
    <div class="line" style="display: flex; align-items: center; gap: 12px" @contextmenu.prevent="
        lyricMenu.showMenuForLyric(
            props.index,
            -1,
            $event.clientX,
            $event.clientY
        )
        ">
        <NCheckbox :checked="curLine.selected" @click="
            curLine.selected = !curLine.selected
            " />
        <div style="display: flex; flex: 1; gap: 8px; flex-direction: column">
            <div style="display: flex; flex: 1; gap: 8px; flex-wrap: wrap">
                <LyricWordEditor v-for="(word, i) in curLine.words" :key="i" :line-index="props.index"
                    :word="word.word" :word-index="i" />
                <NInput class="new-word" round autosize ref="inputRef" placeholder="新单词" :value="editState.newWord"
                    @input="editState.newWord = $event" @change="onAddNewWord" style="min-width: 100px" />
            </div>
            <div v-if="settings.showTranslateLine">
                <NInput round placeholder="翻译歌词" :value="editState.translateLine" @input="editState.translateLine = $event"
                    @change="lyric.modifyTranslatedLine(props.index, editState.translateLine)" style="min-width: 100px" />
            </div>
            <div v-if="settings.showRomanLine">
                <NInput round placeholder="音译歌词" :value="editState.romanLine" @input="editState.romanLine = $event"
                    @change="lyric.modifyRomanLine(props.index, editState.romanLine)" style="min-width: 100px" />
            </div>
        </div>
        <NIcon size="24" v-if="curLine.isBackground" color="#1166FF">
            <VideoBackgroundEffect24Filled />
        </NIcon>
        <NIcon size="24" v-if="curLine.isDuet" color="#63e2b7">
            <TextAlignRight24Filled />
        </NIcon>
        <NButton quaternary circle style="margin-left: 4px" @click="lyric.removeLine(props.index)">
            <NIcon>
                <Dismiss12Filled />
            </NIcon>
        </NButton>
    </div>
</template>

<script setup lang="tsx">
import { NInput, NCheckbox, NButton, NIcon, type InputInst } from "naive-ui";
import { useEditingLyric, useRightClickLyricLine, useSettings } from "../store";
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { Dismiss12Filled, TextAlignRight24Filled, VideoBackgroundEffect24Filled } from "@vicons/fluent";
import LyricWordEditor from "./LyricWordEditor.vue";

const props = defineProps<{
    index: number;
}>();
const lyric = useEditingLyric();
const curLine = computed(() => lyric.lyrics[props.index]);
const lyricMenu = useRightClickLyricLine();
const editState = reactive({
    newWord: "",
    translateLine: curLine.value.translatedLyric,
    romanLine: curLine.value.romanLyric,
});
const settings = useSettings();
const inputRef = ref<InputInst | null>(null);

lyric.$subscribe(() => {
    editState.translateLine = curLine.value.translatedLyric;
    editState.romanLine = curLine.value.romanLyric;
}, {
    flush: "post",
});

function onAddNewWord() {
    lyric.addNewWord(props.index, editState.newWord);
    editState.newWord = "";
}

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
