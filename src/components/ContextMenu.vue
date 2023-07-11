<template>
    <NDropdown trigger="manual" :show="lyricLineMenu.show" @select="onSelectMenu" :x="lyricLineMenu.x" :y="lyricLineMenu.y"
        placement="bottom-start" :options="lyricLineMenu.selectedWord === -1 ? lineContextMenu : wordOnlyContextMenu"
        @clickoutside="lyricLineMenu.show = false" />
</template>

<script setup lang="ts">
import {
    NDropdown,
    useNotification,
} from "naive-ui";
import { onMounted } from "vue";
import { useRightClickLyricLine, useEditingLyric } from "../store";
import type { DropdownMixedOption } from "naive-ui/es/dropdown/src/interface";

const lineContextMenu = [
    { label: '删除选定歌词行', key: 'delete-line' },
    { label: '在选定歌词行前插入新歌词行', key: 'insert-before-line' },
    { label: '在选定歌词行后插入新歌词行', key: 'insert-after-line' },
] as DropdownMixedOption[];
const wordOnlyContextMenu = [
    { label: '删除选定单词', key: 'delete-word' },
    { label: '切割当前单词', key: 'split-word' },
    { type: 'divider', },
    ...lineContextMenu
] as DropdownMixedOption[];

const lyricLineMenu = useRightClickLyricLine();
const notify = useNotification();
const lyric = useEditingLyric();

function onSelectMenu(key: string) {
    switch (key) {
        case "delete-line": {
            lyric.removeLine(lyricLineMenu.selectedLine);
            break;
        }
        case "delete-word": {
            lyric.removeWord(lyricLineMenu.selectedLine, lyricLineMenu.selectedWord);
            break;
        }
        case "insert-before-line": {
            lyric.insertNewLineAt(lyricLineMenu.selectedLine);
            break;
        }
        case "insert-after-line": {
            lyric.insertNewLineAt(lyricLineMenu.selectedLine + 1);
            break;
        }
        default: {
            notify.error({
                title: "功能暂未实现",
                content: "请静候作者爆肝实现吧~",
                duration: 4000,
            });
        }
    }
    lyricLineMenu.show = false;
}

onMounted(() => {
    // ask before page close
    window.addEventListener("beforeunload", evt => {
        evt.preventDefault();
        return evt.returnValue = "";
    })
});
</script>