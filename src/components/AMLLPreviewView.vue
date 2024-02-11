<!--
  - Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
  -
  - 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
  - This source code file is a part of AMLL TTML Tool project.
  - 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
  - Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
  -
  - https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
  -->

<template>
    <div class="amll-preview-view">
        <LyricPlayer enable enable-spring enable-scale enable-blur align-anchor="top" :align-position="0.2" ref="playerRef"
            :current-time="audio.currentTimeMS" :lyric-lines="lyric.lineForPreview" />
    </div>
</template>

<style lang="sass" scoped>
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
import {LyricPlayer, type LyricPlayerRef} from "@applemusic-like-lyrics/vue";
import {onMounted, ref} from "vue";
import {useAudio, useEditingLyric} from "../store";

const audio = useAudio();
const lyric = useEditingLyric();
const playerRef = ref<LyricPlayerRef>();

onMounted(() => {
    playerRef.value?.lyricPlayer.value?.calcLayout(true);
    playerRef.value?.lyricPlayer.value?.update(0);
});

</script>
