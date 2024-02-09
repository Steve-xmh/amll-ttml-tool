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
    <div class="lyric-editor">
        <div style="overflow: hidden;">
            <DynamicScroller :items="lyric.lineWithIds" :min-item-size="getMinHeight()"
                style="width: 100%; position: relative; min-height: fit-content; height: 100%;"
                v-slot="{ item, index, active }">
                <DynamicScrollerItem :item="item" :active="active" watch-data>
                    <div v-if="active" class="line-item" style="padding: 12px" @contextmenu.prevent="
                        lyricMenu.showMenuForLyric(index, -1, $event.clientX, $event.clientY)
                        ">
                        <LyricLineEditor :line="item" />
                    </div>
                </DynamicScrollerItem>
            </DynamicScroller>
        </div>
        <div style="margin: 12px">
            <NButton :dashed="lyric.lineWithIds.length > 0" block :type="lyric.lineWithIds.length === 0 ? 'primary' : 'default'"
                @click="onAddNewLine">
                <i18n-t keypath="lyricEditor.addNewLineBtn" />
            </NButton>
        </div>
    </div>
</template>

<script setup lang="tsx">
import {NButton} from "naive-ui";
import {useEditingLyric, useRightClickLyricLine, useSettings} from "../store";
import LyricLineEditor from "./LyricLineEditor.vue";
import {DynamicScroller, DynamicScrollerItem} from 'vue-virtual-scroller'
import {onMounted, onUnmounted} from "vue";

const settings = useSettings();

function getMinHeight() {
    if (settings.showTranslateLine && settings.showRomanLine) {
        return 142;
    } else if (settings.showTranslateLine || settings.showRomanLine) {
        return 100
    } else {
        return 58;
    }
}

const lyric = useEditingLyric();
const { addNewLine } = lyric;
const lyricMenu = useRightClickLyricLine();

function onAddNewLine() {
    addNewLine();
}

function onKeyPress(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        lyric.undo();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
  } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyY") {
        lyric.redo();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
  } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyA") {
        lyric.selectAllLine();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
}

onMounted(() => {
    window.addEventListener("keypress", onKeyPress);
})

onUnmounted(() => {
    window.removeEventListener("keypress", onKeyPress);
})
</script>

<style lang="sass">
.lyric-editor
    display: flex
    flex-direction: column
    height: 100%
    .line-item
        border-bottom: 1px solid rgba(170, 170, 170, 0.2666666667)
</style>
