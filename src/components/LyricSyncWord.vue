<template>
    <div v-show="props.word.word.trim().length > 0" @click="currentWord.wordIndex = props.word.id">
        <div v-if="displayWord.htmlWord" v-html="displayWord.htmlWord"></div>
        <div v-else>{{ displayWord.word }}</div>
        <div>{{ toTimestamp(props.word.startTime ?? 0) }}</div>
        <div>{{ toTimestamp(props.word.endTime ?? 0) }}</div>
        <div v-if="props.word.id === currentWord.wordIndex">{{ toTimestamp(currentTimeMS) }}</div>
        <div v-if="props.word.id === currentWord.wordIndex" />
    </div>
</template>

<script lang="ts" setup>
import { useAudio, useCurrentSyncWord, useSettings } from "../store";
import { reactive, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { kuroshiro } from "../utils/kuroshiro-analyzer-kuromoji-fix-dict";
import type { LyricWordWithId } from "../store/lyric";

const currentWord = useCurrentSyncWord();
const audio = useAudio();
const settings = useSettings();
const { currentTimeMS } = storeToRefs(audio);

const props = defineProps<{
    word: LyricWordWithId;
}>();

const displayWord = reactive({
    word: props.word.word,
    htmlWord: "",
});

watch(() => [props.word, settings.showJpnRomaji], async () => {
    displayWord.word = props.word.word;
    displayWord.htmlWord = "";
    if (settings.showJpnRomaji) {
        displayWord.htmlWord = await kuroshiro.convert(displayWord.word, { to: 'romaji', mode: "furigana" })
    }
}, { flush: "post" });

onMounted(async () => {
    if (settings.showJpnRomaji) {
        displayWord.htmlWord = await kuroshiro.convert(displayWord.word, { to: 'romaji', mode: "furigana" })
    }
})

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