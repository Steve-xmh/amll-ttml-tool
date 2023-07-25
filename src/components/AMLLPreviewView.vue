<template>
    <div style="background-color: #222; width: 100%; height: 100%;">
        <LyricPlayer enable ref="playerRef" :current-time="audio.currentTimeMS" :lyric-lines="lyric.lineForPreview"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; mix-blend-mode: plus-lighter;" />
    </div>
</template>

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
