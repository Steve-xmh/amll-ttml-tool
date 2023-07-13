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
        <div style="display: flex; flex: 1; gap: 8px; flex-direction: column">
            <div style="display: flex; flex: 1; gap: 8px; flex-wrap: wrap">
                <Draggable :list="props.line.words" item-key="id" @sort="onSort">
                    <template #item="{ element }">
                        <LyricWordEditor :line-index="element.lineIndex" :word="element.word" :word-index="element.id" />
                    </template>
                </Draggable>
                <NInput class="new-word" round autosize ref="inputRef" placeholder="新单词" :value="editState.newWord"
                    @input="editState.newWord = $event" @change="onAddNewWord" style="min-width: 100px" />
            </div>
            <div v-if="settings.showTranslateLine">
                <NInput round placeholder="翻译歌词" :value="editState.translateLine" @input="editState.translateLine = $event"
                    @change="lyric.modifyTranslatedLine(props.line.id, editState.translateLine)" style="min-width: 100px" />
            </div>
            <div v-if="settings.showRomanLine">
                <NInput round placeholder="音译歌词" :value="editState.romanLine" @input="editState.romanLine = $event"
                    @change="lyric.modifyRomanLine(props.line.id, editState.romanLine)" style="min-width: 100px" />
            </div>
        </div>
        <NIcon size="24" v-if="props.line.isBackground" color="#1166FF">
            <VideoBackgroundEffect24Filled />
        </NIcon>
        <NIcon size="24" v-if="props.line.isDuet" color="#63e2b7">
            <TextAlignRight24Filled />
        </NIcon>
        <NButton quaternary circle style="margin-left: 4px" @click="lyric.removeLine(props.line.id)">
            <NIcon>
                <Dismiss12Filled />
            </NIcon>
        </NButton>
    </div>
</template>

<script setup lang="tsx">
import { NInput, NCheckbox, NButton, NIcon, type InputInst } from "naive-ui";
import { useEditingLyric, useRightClickLyricLine, useSettings } from "../store";
import { computed, watch, nextTick, onMounted, reactive, ref } from "vue";
import Draggable from 'vuedraggable'
import { Dismiss12Filled, TextAlignRight24Filled, VideoBackgroundEffect24Filled } from "@vicons/fluent";
import LyricWordEditor from "./LyricWordEditor.vue";
import type { LyricLineWithId } from "../store/lyric";

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
const inputRef = ref<InputInst | null>(null);

function onSort(e: CustomEvent & {
    oldIndex: number;
    newIndex: number;
}) {
    lyric.reorderWord(props.line.id, e.oldIndex, e.newIndex);
}

watch(() => props.line, () => {
    editState.translateLine = props.line.translatedLyric;
    editState.romanLine = props.line.romanLyric;
}, {
    flush: "post",
});

function onAddNewWord() {
    lyric.addNewWord(props.line.id, editState.newWord);
    editState.newWord = "";
}

</script>

<style lang="sass" scoped>
.new-word
    opacity: 0
    transition: opacity 0.2s
    &:has(:focus)
        opacity: 1
    @media screen and (max-width: 768px)
        opacity: 1
.line:hover .new-word
    opacity: 1
</style>
