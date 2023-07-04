<template>
    <div class="lyric-editor">
        <div style="overflow: hidden;">
            <DynamicScroller :items="lines" :min-item-size="getMinHeight()"
                style="width: 100%; position: relative; min-height: fit-content; height: 100%;" key-field="lineIndex"
                v-slot="{ item, index, active }">
                <DynamicScrollerItem :item="item" :active="active" watch-data>
                    <div class="line-item" style="padding: 12px" @contextmenu.prevent="
                        lyricMenu.showMenuForLyric(index, -1, $event.clientX, $event.clientY)
                        ">
                        <LyricLineEditor :index="index" />
                    </div>
                </DynamicScrollerItem>
            </DynamicScroller>
        </div>
        <div style="margin: 12px">
            <NButton :dashed="lines.length > 0" block :type="lines.length === 0 ? 'primary' : 'default'"
                @click="onAddNewLine"> 增加一行歌词 </NButton>
        </div>
    </div>
</template>

<script setup lang="tsx">
import { NButton } from "naive-ui";
import { storeToRefs } from "pinia";
import { useEditingLyric, useRightClickLyricLine, useSettings } from "../store";
import LyricLineEditor from "./LyricLineEditor.vue";
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { computed } from "vue";

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
const lyricRef = storeToRefs(lyric);
const lines = computed(() => lyricRef.lyrics.value.map((w, i) => { return { lineIndex: i, words: w.words } }));
const { addNewLine } = lyric;
const lyricMenu = useRightClickLyricLine();

function onAddNewLine() {
    addNewLine();
}
</script>

<style lang="sass">
.lyric-editor
    display: flex
    flex-direction: column
    height: 100%
    .line-item
        border-bottom: 1px solid var(--att-border-color)
</style>
