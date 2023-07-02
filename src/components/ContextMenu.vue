<template>
    <NDropdown trigger="manual" :show="lyricLineMenu.show" @select="onSelectMenu" :x="lyricLineMenu.x"
        :y="lyricLineMenu.y" placement="bottom-start"
        :options="lyricLineMenu.selectedWord === -1 ? lineContextMenu : wordOnlyContextMenu"
        @clickoutside="lyricLineMenu.show = false" />
</template>

<script setup lang="ts">
import {
    NDropdown,
    useNotification,
} from "naive-ui";
import { onMounted } from "vue";
import { useRightClickLyricLine } from "../store";
import type { DropdownMixedOption } from "naive-ui/es/dropdown/src/interface";

const lineContextMenu = [
    { label: '删除选定歌词行', key: 'delete-line' },
] as DropdownMixedOption[];
const wordOnlyContextMenu = [
    { label: '删除选定单词', key: 'delete-word' },
    { label: '切割当前单词', key: 'split-word' },
    { type: 'divider', },
    ...lineContextMenu
] as DropdownMixedOption[];

const lyricLineMenu = useRightClickLyricLine();
const notify = useNotification();

function onSelectMenu(key: string) {
    notify.error({
        title: "功能暂未实现",
        content: "请静候作者爆肝实现吧~",
        duration: 4000,
    });
}

onMounted(() => {
    // ask before page close
    window.addEventListener("beforeunload", evt => {
        evt.preventDefault();
        return evt.returnValue = "";
    })
});
</script>