<template>
    <NListItem :class="{ 'lyric-line-item': true, 'lyric-line-item-selected': currentWord.lineIndex === props.index }"
        @click="currentWord.lineIndex = props.index; currentWord.wordIndex = 0;" ref="itemRef">
        <div class="lyric-line-item-inner">
            <div>{{ toTimestamp(line.words?.[0]?.startTime ?? 0) }}</div>
            <div>
                <div class="sync-line"><span v-for="word, wi in line.words" :key="wi"
                        :class="props.index === currentWord.lineIndex && wi === currentWord.wordIndex ? 'current-word' : ''">{{
                            word.word }}</span></div>
                <div v-show="settings.showTranslateLine">{{ line.translatedLyric }}</div>
                <div v-show="settings.showRomanLine">{{ line.romanLyric }}</div>
            </div>
        </div>
    </NListItem>
</template>

<script setup lang="ts">
import { NListItem } from "naive-ui";
import { useEditingLyric, useSettings, useCurrentSyncWord } from "../store";
import { ref } from "vue"
const itemRef = ref<{
    $el?: HTMLLIElement
}>();

const currentWord = useCurrentSyncWord();
const settings = useSettings();

const props = defineProps<{
    index: number
}>();
const lyric = useEditingLyric();
const line = lyric.lyrics[props.index];

currentWord.$subscribe((mut) => {
    const evt = mut.events instanceof Array ? mut.events[0] : mut.events;
    if (evt.key === "lineIndex" && itemRef.value && currentWord.lineIndex === props.index) {
        itemRef.value.$el?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
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

</script>

<style lang="sass">
.sync-line > *
    margin-right: 6px
.lyric-line-item
    cursor: pointer
    outline-offset: -4px
    &.lyric-line-item-selected
        outline: 3px solid #63e2b7
    &:hover
        background: var(--n-color-hover)
        color: var(--n-text-color-hover)
.current-word
    color: #63e2b7
    font-weight: bold
.lyric-line-item-inner
    display: flex
    align-items: center
    margin: 0 12px
    gap: 12px
    > *:nth-child(2)
        font-size: 18px
</style>
