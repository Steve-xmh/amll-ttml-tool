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
  <NPopover :arrow="false" :options="lyricLineMenu.selectedWord === -1 ? lineContextMenu : wordOnlyContextMenu" :show="lyricLineMenu.show"
            :x="lyricLineMenu.x"
            :y="lyricLineMenu.y"
            class="context-menu"
            placement="bottom-start"
            style="padding: 4px"
            trigger="manual"
            @clickoutside="lyricLineMenu.show = false">
    <ContextMenuWordEdit/>
    <NEl tag="button"
         @click="() => {lyric.removeWord(lyricLineMenu.selectedLine, lyricLineMenu.selectedWord); lyricLineMenu.show = false;}">
      <i18n-t keypath="contextMenu.deleteWord"/>
    </NEl>
    <NEl tag="button" @click="showWipNotification">
      <i18n-t keypath="contextMenu.splitWord"/>
    </NEl>
    <NDivider style="margin: 4px 0"/>
    <NEl tag="button" @click="() => {lyric.removeLine(lyricLineMenu.selectedLine); lyricLineMenu.show = false;}">
      <i18n-t keypath="contextMenu.deleteLine"/>
    </NEl>
    <NEl tag="button" @click="() => {lyric.insertNewLineAt(lyricLineMenu.selectedLine); lyricLineMenu.show = false;}">
      <i18n-t keypath="contextMenu.insertBeforeLine"/>
    </NEl>
    <NEl tag="button"
         @click="() => {lyric.insertNewLineAt(lyricLineMenu.selectedLine + 1); lyricLineMenu.show = false;}">
      <i18n-t keypath="contextMenu.insertAfterLine"/>
    </NEl>
    <NEl tag="button"
         @click="() => { const line = lyric.lyrics[lyricLineMenu.selectedLine]; if (line) line.isBG = !line.isBG; lyricLineMenu.show = false; }">
      <i18n-t keypath="contextMenu.toggleBGLine"/>
    </NEl>
    <NEl tag="button"
         @click="() => { const line = lyric.lyrics[lyricLineMenu.selectedLine]; if (line) line.isDuet = !line.isDuet; lyricLineMenu.show = false; }">
      <i18n-t keypath="contextMenu.toggleDuetLine"/>
    </NEl>
  </NPopover>
</template>

<script setup lang="tsx">
import {NDivider, NEl, NPopover, useNotification} from "naive-ui";
import {onMounted} from "vue";
import {useEditingLyric, useRightClickLyricLine} from "../store";
import type {DropdownMixedOption} from "naive-ui/es/dropdown/src/interface";
import {i18n} from '../i18n';
import ContextMenuWordEdit from "./ContextMenuWordEdit.vue";

const lineContextMenu = [
  {label: i18n.global.t("contextMenu.deleteLine"), key: 'delete-line'},
  {label: i18n.global.t("contextMenu.insertBeforeLine"), key: 'insert-before-line'},
  {label: i18n.global.t("contextMenu.insertAfterLine"), key: 'insert-after-line'},
  {label: i18n.global.t("contextMenu.toggleBGLine"), key: 'toggle-bg-line'},
  {label: i18n.global.t("contextMenu.toggleDuetLine"), key: 'toggle-duet-line'},
] as DropdownMixedOption[];
const wordOnlyContextMenu = [
  {type: "render", render: () => <ContextMenuWordEdit/>},
  {label: i18n.global.t("contextMenu.deleteWord"), key: 'delete-word'},
  {label: i18n.global.t("contextMenu.splitWord"), key: 'split-word'},
  {type: 'divider',},
  ...lineContextMenu
] as DropdownMixedOption[];

const lyricLineMenu = useRightClickLyricLine();
const notify = useNotification();
const lyric = useEditingLyric();

function showWipNotification() {
  notify.error({
    title: i18n.global.t("contextMenu.wipNotification.title"),
    content: i18n.global.t("contextMenu.wipNotification.content"),
    duration: 4000,
  });
  lyricLineMenu.show = false;
}

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
    case "toggle-bg-line": {
      const line = lyric.lyrics[lyricLineMenu.selectedLine];
      if (line) line.isBG = !line.isBG;
      break;
    }
    case "toggle-duet-line": {
      const line = lyric.lyrics[lyricLineMenu.selectedLine];
      if (line) line.isDuet = !line.isDuet;
      break;
    }
    case "insert-before-line": {

      break;
    }
    case "insert-after-line": {

      break;
    }
    default: {
      notify.error({
        title: i18n.global.t("contextMenu.wipNotification.title"),
        content: i18n.global.t("contextMenu.wipNotification.content"),
        duration: 4000,
      });
    }
  }

}

onMounted(() => {
  // ask before page close
  window.addEventListener("beforeunload", evt => {
    evt.preventDefault();
    return evt.returnValue = "";
  })
});
</script>

<style lang="sass" scoped>
.context-menu
  button
    display: block
    width: 100%
    text-align: left
    border-radius: var(--border-radius-small)
    font-family: var(--font-family)
    font-size: var(--font-size)
    color: var(--text-color-base)
    background-color: transparent
    border: none
    transition: background-color 0.2s ease-in-out
    cursor: pointer
    padding: 0.5em 1em
    margin-top: 2px

    &:hover
      background-color: var(--button-color-2-hover)
</style>
