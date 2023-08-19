<template>
    <div class="lyric-sync-editor">
        <div class="lyric-line-sync-editor" v-if="lyric.lyrics[currentWord.lineIndex]">
            <template v-if="lyric.lineWithIds[currentWord.lineIndex - 1]">
                <LyricSyncWord v-for="(word, i) in lyric.lineWithIds[currentWord.lineIndex - 1].words" not-main :key="i" :word="word" />
            </template>
            <LyricSyncWord v-for="(word, i) in lyric.lineWithIds[currentWord.lineIndex].words" :key="i" :word="word" />
            <template v-if="lyric.lineWithIds[currentWord.lineIndex + 1]">
                <LyricSyncWord v-for="(word, i) in lyric.lineWithIds[currentWord.lineIndex + 1].words" not-main :key="i" :word="word" />
            </template>
        </div>
        <div class="lyric-line-sync-editor-no-selected" v-else>
            <div style="white-space: pre-line;">
                <i18n-t keypath="lyricSyncEditor.unselectedTip" />
            </div>
        </div>
        <div class="lyric-line-viewer">
            <DynamicScroller :items="lyric.lineWithIds" :min-item-size="lineMinHeight"
                style="width: 100%; position: relative; min-height: fit-content; height: 100%;" key-field="id"
                v-slot="{ item, index, active }">
                <DynamicScrollerItem :item="item" :active="active" watch-data>
                    <LyricSyncLine v-if="active" :line="item" />
                </DynamicScrollerItem>
            </DynamicScroller>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useEditingLyric, useAudio, useCurrentSyncWord, useSettings } from "../store";
import { nextTick, onMounted, onUnmounted, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import LyricSyncLine from "./LyricSyncLine.vue";
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import type { LyricWord } from "../store/lyric";
import LyricSyncWord from "./LyricSyncWord.vue";

const currentWord = useCurrentSyncWord();
const audio = useAudio();
const settings = useSettings();
const { setCurrentTime } = audio;
const { currentTimeMS } = storeToRefs(audio);
const syncEditor = ref<HTMLDivElement>();
const lyric = useEditingLyric();
const lineMinHeight = computed(getMinHeight);

function getMinHeight() {
    if (settings.showTranslateLine && settings.showRomanLine) {
        return 95;
    } else if (settings.showTranslateLine || settings.showRomanLine) {
        return 66
    } else {
        return 37;
    }
}

currentWord.$subscribe((mut) => {
    const evt = mut.events instanceof Array ? mut.events[0] : mut.events;
    if (evt.key === "wordIndex" && syncEditor.value) {
        const el = syncEditor.value.children.item(currentWord.wordIndex)
        nextTick(() => {
            el?.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        })
    }
}, { flush: "post" });

function toTimestamp(duration: number) {
    const isRemainTime = duration < 0;

    const d = Math.abs(duration / 1000);
    const sec = d % 60;
    const min = Math.floor((d - sec) / 60);
    const secFixed = sec.toFixed(3);
    const secText = "0".repeat(6 - secFixed.length) + secFixed;

    return `${isRemainTime ? "-" : ""}${min}:${secText}`;
}

function isBlankWord(lineIndex = currentWord.lineIndex, wordIndex = currentWord.wordIndex) {
    return (lyric.lineWithIds[lineIndex]?.words?.[wordIndex]?.word?.trim()?.length ?? 0) === 0;
}

function isWordExist(lineIndex = currentWord.lineIndex, wordIndex = currentWord.wordIndex) {
    return !!lyric.lyrics[lineIndex]?.words?.[wordIndex];
}

function getCurrentWord(): LyricWord | undefined {
    const word = lyric.lyrics[currentWord.lineIndex]?.words?.[currentWord.wordIndex];
    return word;
}

function moveRight() {
    let lineIndex = currentWord.lineIndex;
    let wordIndex = currentWord.wordIndex;
    do {
        if (wordIndex < lyric.lineWithIds[lineIndex].words.length - 1) {
            wordIndex++;
        } else if (lineIndex < lyric.lineWithIds.length - 1) {
            wordIndex = 0;
            lineIndex++;
        } else {
            break;
        }
    } while (isWordExist(lineIndex, wordIndex) && isBlankWord(lineIndex, wordIndex));
    if (isWordExist(lineIndex, wordIndex) && !isBlankWord(lineIndex, wordIndex)) {
        currentWord.wordIndex = wordIndex;
        currentWord.lineIndex = lineIndex;
    }
}

function moveLeft() {
    let lineIndex = currentWord.lineIndex;
    let wordIndex = currentWord.wordIndex;
    do {
        if (wordIndex > 0) {
            wordIndex--;
        } else if (lineIndex > 0) {
            wordIndex = lyric.lineWithIds[--lineIndex].words.length - 1;
        } else {
            break;
        }
    } while (isWordExist(lineIndex, wordIndex) && isBlankWord(lineIndex, wordIndex));
    if (isWordExist(lineIndex, wordIndex) && !isBlankWord(lineIndex, wordIndex)) {
        currentWord.wordIndex = wordIndex;
        currentWord.lineIndex = lineIndex;
    }
}

function moveUp() {
    let lineIndex = currentWord.lineIndex;
    let wordIndex = currentWord.wordIndex;
    do {
        if (lineIndex > 0) {
            lineIndex--;
            wordIndex = 0;
        } else {
            break;
        }
    } while (isWordExist(lineIndex, wordIndex) && isBlankWord(lineIndex, wordIndex));
    if (isWordExist(lineIndex, wordIndex) && !isBlankWord(lineIndex, wordIndex)) {
        currentWord.wordIndex = wordIndex;
        currentWord.lineIndex = lineIndex;
    }
}

function moveDown() {
    let lineIndex = currentWord.lineIndex;
    let wordIndex = currentWord.wordIndex;
    do {
        if (lineIndex < lyric.lineWithIds.length - 1) {
            lineIndex++;
            wordIndex = 0;
        } else {
            break;
        }
    } while (isWordExist(lineIndex, wordIndex) && isBlankWord(lineIndex, wordIndex));
    if (isWordExist(lineIndex, wordIndex) && !isBlankWord(lineIndex, wordIndex)) {
        currentWord.wordIndex = wordIndex;
        currentWord.lineIndex = lineIndex;
    }
}

function onKeyPress(e: KeyboardEvent) {
    if((e.target as HTMLElement)?.nodeName === 'INPUT') return;
    let collected = false;
    switch (e.code) {
        case "KeyA": // 移动到上一个单词
            moveLeft();
            collected = true;
            break;
        case "KeyD": // 移动到下一个单词
            moveRight();
            collected = true;
            break;
        case "KeyW": // 移动到上一行歌词的第一个单词
            moveUp();
            collected = true;
            break;
        case "KeyS": // 移动到下一个单词的第一个单词
            moveDown();
            collected = true;
            break;
        case "KeyR": { // 移动到上一个单词，并设置播放位置为目标单词的​起始时间
            moveLeft();
            const curWord = getCurrentWord();
            if (curWord) setCurrentTime(curWord.startTime);
            collected = true;
            break;
        }
        case "KeyY": { // 移动到下一个单词，并设置播放位置为目标单词的​起始时间
            moveRight();
            const curWord = getCurrentWord();
            if (curWord) setCurrentTime(curWord.startTime);
            collected = true;
            break;
        }
        case "KeyF": { // 记录当前时间为当前单词的起始时间
            const curWord = getCurrentWord();
            if (curWord) curWord.startTime = currentTimeMS.value;
            collected = true;
            break;
        }
        case "KeyG": { // 记录当前时间为当前单词的结束时间和下一个单词的起始时间，并移动到下一个单词
            const curWord = getCurrentWord();
            if (curWord) curWord.endTime = currentTimeMS.value;
            moveRight();
            const nextWord = getCurrentWord();
            if (nextWord) nextWord.startTime = currentTimeMS.value;
            collected = true;
            break;
        }
        case "KeyH": { // 记录当前时间为当前单词的结束时间，并移动到下一个单词（用于空出间奏时间）
            const curWord = getCurrentWord();
            if (curWord) curWord.endTime = currentTimeMS.value;
            moveRight();
            collected = true;
            break;
        }
    }
    if (collected) {
        e.preventDefault();
        e.stopPropagation();
    }
}

onMounted(() => {
    document.body.addEventListener("keypress", onKeyPress);
});

onUnmounted(() => {
    document.body.removeEventListener("keypress", onKeyPress);
});

</script>

<style lang="sass">
.lyric-sync-editor
    display: flex
    flex-direction: column
    height: 100%
    max-height: 100%
    overflow: hidden
.lyric-line-sync-editor-no-selected
    flex: 1
    align-self: center
    justify-content: center
    align-items: center
    overflow: hidden
    max-width: 100%
    min-height: 128px
    display: flex
    text-align: center
.lyric-line-sync-editor
    flex: 1
    align-self: center
    overflow: auto hidden
    max-width: 100%
    min-height: 128px
    display: flex
    align-items: stretch
    padding: 0 32px
    white-space: nowrap
    > *
        display: grid
        grid-template: "selectMark selectMark" "selectArrow selectArrow" "word word" "startTime endTime"
        align-content: center
        border-left: 1px solid #AAA4
        padding: 0 12px
        user-select: none
        cursor: pointer
        &:first-child
            border-left: none
        > *:nth-child(1)
            grid-area: word
            font-size: 32px
            text-align: center
        > *:nth-child(2)
            grid-area: startTime
            font-size: 12px
            text-align: left
        > *:nth-child(3)
            grid-area: endTime
            margin-left: 8px
            font-size: 12px
            text-align: right
        > *:nth-child(4)
            grid-area: selectMark
            font-size: 12px
            text-align: center
            color: var(--att-theme-color)
            font-weight: bold
        > *:nth-child(5)
            grid-area: selectArrow
            align-self: center
            justify-self: center
            content: ""
            width: 0
            height: 0
            margin-bottom: 8px
            border-left: 4px solid transparent
            border-right: 4px solid transparent
            border-top: 4px solid var(--att-theme-color)
.word-selected
    grid-area: selectMark
.lyric-line-viewer
    flex: 5
    position: relative
    align-self: stretch
    min-height: 0
    overflow: hidden auto
</style>
