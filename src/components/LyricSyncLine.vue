<template>
    <NListItem :class="{
        'lyric-line-item': true,
        'lyric-line-item-selected': currentWord.lineIndex === props.index,
    }" @click="
    currentWord.lineIndex = props.index;
currentWord.wordIndex = 0;
" ref="itemRef">
        <div class="lyric-line-item-inner">
            <div>{{ toTimestamp(line.words?.[0]?.startTime ?? 0) }}</div>
            <div>
                <div :class="{
                    'hot-line':
                        line.words.length > 0 &&
                        line.words[0].startTime <= currentTime &&
                        line.words[line.words.length - 1].endTime > currentTime,
                }">
                    <span v-for="(word, wi) in line.words" :key="wi" :class="{
                        'current-word':
                            props.index === currentWord.lineIndex &&
                            wi === currentWord.wordIndex,
                        'hot-word':
                            word.startTime <= currentTime && word.endTime > currentTime,
                    }">{{ word.word }}</span>
                </div>
                <div v-if="settings.showTranslateLine">{{ line.translatedLyric }}</div>
                <div v-if="settings.showRomanLine">{{ line.romanLyric }}</div>
            </div>
        </div>
    </NListItem>
</template>

<script setup lang="ts">
import { NListItem } from "naive-ui";
import {
    useEditingLyric,
    useSettings,
    useAudio,
    useCurrentSyncWord,
} from "../store";
import { storeToRefs } from "pinia";
import { nextTick, ref } from "vue";
const itemRef = ref<{
    $el?: HTMLLIElement;
}>();

const { currentTime } = storeToRefs(useAudio());
const currentWord = useCurrentSyncWord();
const settings = useSettings();

const props = defineProps<{
    index: number;
}>();
const lyric = storeToRefs(useEditingLyric());
const line = lyric.lyrics.value[props.index];

currentWord.$subscribe(
    (mut) => {
        const evt = mut.events instanceof Array ? mut.events[0] : mut.events;
        if (
            evt.key === "lineIndex" &&
            itemRef.value &&
            currentWord.lineIndex === props.index
        ) {
            const el = itemRef.value.$el;
            nextTick(() => {
                el?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                });
            })
        }
    },
    { flush: "post" }
);

function toTimestamp(duration: number) {
    const isRemainTime = duration < 0;

    const d = Math.abs(duration / 1000);
    const sec = d % 60;
    const min = Math.floor((d - sec) / 60);
    const secFixed = sec.toFixed(3);
    const secText = "0".repeat(6 - secFixed.length) + secFixed;

    return `${isRemainTime ? "-" : ""}${min}:${secText}`;
}
</script>

<style lang="sass">
.sync-line > *
    margin-right: 6px
.lyric-line-item
    cursor: pointer
    outline-offset: -4px
    &.lyric-line-item-selected
        outline: 3px solid var(--n-theme-color) //#63e2b7
    &:hover
        background: var(--n-color-hover)
        color: var(--n-text-color-hover)
.hot-line
    color: var(--n-theme-color-hover)
    opacity: 0.7
.hot-word
    color: var(--n-theme-color-pressed)
.current-word
    color: var(--n-theme-color)
    font-weight: bold
.lyric-line-item-inner
    display: flex
    align-items: center
    margin: 0 12px
    gap: 12px
    > *:nth-child(2)
        font-size: 18px
</style>
