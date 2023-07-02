<template>
    <div class="lyric-sync-editor">
        <div class="lyric-line-sync-editor" v-if="lyric.lyrics[currentWord.lineIndex]" ref="syncEditor">
            <div v-for="(word, i) in lyric.lyrics[currentWord.lineIndex].words" v-show="word.word.trim().length > 0"
                :key="i" @click="currentWord.wordIndex = i">
                <div>{{ word.word }}</div>
                <div>{{ toTimestamp(word.startTime ?? 0) }}</div>
                <div>{{ toTimestamp(word.endTime ?? 0) }}</div>
                <div v-if="i === currentWord.wordIndex">{{ toTimestamp(currentTime) }}</div>
                <div v-if="i === currentWord.wordIndex" />
            </div>
        </div>
        <div class="lyric-line-sync-editor-no-selected" v-else>
            <div>
                <div>尚未选中歌词</div>
                <div>点击下方的歌词行以选中歌词开始打轴</div>
            </div>
        </div>
        <div class="lyric-line-viewer">
            <NList>
                <LyricSyncLine v-for="(line, i) in lyric.lyrics" :key="i" :index="i" />
            </NList>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NList, useThemeVars } from "naive-ui";
import { useEditingLyric, useSettings, useAudio, useCurrentSyncWord } from "../store";
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import LyricSyncLine from "./LyricSyncLine.vue";
import type { LyricWord } from "../store/lyric";

const currentWord = useCurrentSyncWord();
const audio = useAudio();
const { setCurrentTime } = audio;
const { currentTime } = storeToRefs(audio);

const syncEditor = ref<HTMLDivElement>();

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

const lyric = useEditingLyric();
const lyricRef = storeToRefs(lyric);

function isBlankWord() {
    return (lyricRef.lyrics.value[currentWord.lineIndex]?.words?.[currentWord.wordIndex]?.word?.trim()?.length ?? 0) === 0;
}

function getCurrentWord(): LyricWord | undefined {
    return lyricRef.lyrics.value?.[currentWord.lineIndex]?.words?.[currentWord.wordIndex];
}

function moveRight() {
    do {
        if (currentWord.wordIndex < lyricRef.lyrics.value[currentWord.lineIndex].words.length - 1) {
            currentWord.wordIndex++;
        } else if (currentWord.lineIndex < lyricRef.lyrics.value.length - 1) {
            currentWord.wordIndex = 0;
            currentWord.lineIndex++;
        }
    } while (isBlankWord());
}

function moveLeft() {
    do {
        if (currentWord.wordIndex > 0) {
            currentWord.wordIndex--;
        } else if (currentWord.lineIndex > 0) {
            currentWord.wordIndex = lyricRef.lyrics.value[--currentWord.lineIndex].words.length - 1;
        }
    } while (isBlankWord());
}

function moveUp() {
    do {
        if (currentWord.lineIndex > 0) {
            currentWord.lineIndex--;
            currentWord.wordIndex = 0;
        } else {
            break;
        }
    } while (isBlankWord());
}

function moveDown() {
    do {
        if (currentWord.lineIndex < lyricRef.lyrics.value.length - 1) {
            currentWord.lineIndex++;
            currentWord.wordIndex = 0;
        } else {
            break;
        }
    } while (isBlankWord());
}

function onKeyPress(e: KeyboardEvent) {
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
            if (curWord) curWord.startTime = currentTime.value;
            collected = true;
            break;
        }
        case "KeyG": { // 记录当前时间为当前单词的结束时间和下一个单词的起始时间，并移动到下一个单词
            const curWord = getCurrentWord();
            if (curWord) curWord.endTime = currentTime.value;
            moveRight();
            const nextWord = getCurrentWord();
            if (nextWord) nextWord.startTime = currentTime.value;
            collected = true;
            break;
        }
        case "KeyH": { // 记录当前时间为当前单词的结束时间，并移动到下一个单词（用于空出间奏时间）
            const curWord = getCurrentWord();
            if (curWord) curWord.endTime = currentTime.value;
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
