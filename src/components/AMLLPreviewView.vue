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
		<LyricPlayer ref="playerRef" :align-position="0.2" :current-time="audio.currentTimeMS" :lyric-lines="lyric.lineForPreview" align-anchor="top" enable
					 enable-blur
					 enable-scale enable-spring/>
	</div>
</template>

<style lang="sass">
.amll-preview-view
	background-color: #222 !important
	width: 100% !important
	height: 100% !important

	> *
		position: absolute !important
		top: 0 !important
		left: 0 !important
		width: 100% !important
		height: 100% !important
		mix-blend-mode: plus-lighter

		> *
			box-sizing: content-box !important
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
