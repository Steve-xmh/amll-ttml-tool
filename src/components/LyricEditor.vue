<template>
    <NList>
        <NListItem v-for="(_line, i) in lyricRef.lyrics.value" :key="i" style="padding: 12px" @contextmenu.prevent="
            lyricMenu.showMenuForLyric(i, -1, $event.clientX, $event.clientY)
            ">
            <LyricLineEditor :index="i" />
        </NListItem>
        <template #footer>
            <div style="margin: 0 12px">
                <NButton dashed block @click="onAddNewLine"> 增加一行歌词 </NButton>
            </div>
        </template>
    </NList>
</template>

<script setup lang="tsx">
import { NButton, NList, NListItem } from "naive-ui";
import { storeToRefs } from "pinia";
import { useEditingLyric, useRightClickLyricLine } from "../store";
import LyricLineEditor from "./LyricLineEditor.vue";

const lyric = useEditingLyric();
const lyricRef = storeToRefs(lyric);
const { addNewLine } = lyric;
const lyricMenu = useRightClickLyricLine();

function onAddNewLine() {
    addNewLine();
}
</script>
