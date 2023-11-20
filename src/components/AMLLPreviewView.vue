<template>
    <div class="amll-preview-view">
        <LyricPlayer enable enable-spring enable-scale enable-blur align-anchor="top" :align-position="0.2" ref="playerRef"
            :current-time="audio.currentTimeMS" :lyric-lines="lyric.lineForPreview" />
    </div>
</template>

<style lang="sass">
.amll-preview-view
    background-color: #222
    width: 100%
    height: 100%
    > *
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        mix-blend-mode: plus-lighter
        > *
            box-sizing: content-box
</style>

<script setup lang="ts">
import { LyricPlayer, type LyricPlayerRef } from "@applemusic-like-lyrics/vue";
import { onMounted, ref } from "vue";
import { useAudio, useEditingLyric } from "../store";

const audio = useAudio();
const lyric = useEditingLyric();
const playerRef = ref<LyricPlayerRef>();

onMounted(() => {
    playerRef.value?.lyricPlayer.value?.calcLayout(true);
    playerRef.value?.lyricPlayer.value?.update(0);
});

</script>
