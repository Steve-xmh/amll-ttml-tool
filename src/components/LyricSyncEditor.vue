<template>
    <div class="lyric-sync-editor">
        <div class="lyric-line-sync-editor" v-if="lyric.lyrics[currentWord.lineIndex]">
            <div v-for="(word, i) in lyric.lyrics[currentWord.lineIndex].words" :key="i">
                <div>{{ word.word }}</div>
                <div>{{ toTimestamp(word.startTime ?? 0) }}</div>
                <div>{{ toTimestamp(word.endTime ?? 0) }}</div>
            </div>
        </div>
        <div class="lyric-line-viewer">
            <NList>
                <NListItem v-for="(line, i) in lyric.lyrics"
                    :class="{ 'lyric-line-item': true, 'lyric-line-item-selected': i === currentWord.lineIndex }" :key="i"
                    @click="currentWord.lineIndex = i">
                    <div class="lyric-line-item-inner">
                        <div>{{ toTimestamp(line.words?.[0].startTime ?? 0) }}</div>
                        <div>
                            <div><span v-for="word, i in line.words" :key="i">{{ word.word }}</span></div>
                            <div v-show="settings.showTranslateLine">{{ line.translatedLyric }}</div>
                            <div v-show="settings.showRomanLine">{{ line.romanLyric }}</div>
                        </div>
                    </div>
                </NListItem>
            </NList>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NList, NListItem } from "naive-ui";
import { useEditingLyric, useSettings } from "../store";
import { reactive } from "vue";

const currentWord = reactive({
    lineIndex: -1,
    wordIndex: -1,
});

const settings = useSettings();

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
</script>

<style lang="sass">
.lyric-sync-editor
    display: flex
    flex-direction: column
    height: 100%
    max-height: 100%
    overflow: hidden
.lyric-line-sync-editor
    flex: 1
    align-self: center
    overflow: auto hidden
    max-width: 100%
    min-height: 128px
    display: flex
    align-items: center
    padding: 0 32px
    > *
        display: grid
        grid-template: "word word" "startTime endTime"
        gap: 8px
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
            font-size: 12px
            text-align: right
.lyric-line-viewer
    flex: 5
    position: relative
    align-self: stretch
    min-height: 0
    overflow: hidden auto
.lyric-line-item
    cursor: pointer
    outline-offset: -4px
    &.lyric-line-item-selected
        outline: 3px solid #63e2b7
    &:hover
        background: var(--n-color-hover)
        color: var(--n-text-color-hover)
.lyric-line-item-inner
    display: flex
    align-items: center
    margin: 0 12px
    gap: 12px
    > *:nth-child(2)
        font-size: 18px
</style>
