<!--
  - Copyright 2023-2024 Steve Xiao (stevexmh@qq.com) and contributors.
  -
  - 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
  - This source code file is a part of AMLL TTML Tool project.
  - 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
  - Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
  -
  - https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
  -->

<template>
  <div class="lyric-sync-editor">
    <div v-if="lyric.lyrics[currentWord.lineIndex]" ref="syncEditor" class="lyric-line-sync-editor"
         @wheel="onSyncEditorScroll">
      <template v-if="lyric.lineWithIds[currentWord.lineIndex - 1]">
        <LyricSyncWord v-for="(word, i) in lyric.lineWithIds[currentWord.lineIndex - 1].words" :key="i" :word="word"
                       not-main/>
      </template>
      <LyricSyncWord v-for="(word, i) in lyric.lineWithIds[currentWord.lineIndex].words" :key="i" :word="word"/>
      <template v-if="lyric.lineWithIds[currentWord.lineIndex + 1]">
        <LyricSyncWord v-for="(word, i) in lyric.lineWithIds[currentWord.lineIndex + 1].words" :key="i" :word="word"
                       not-main/>
      </template>
    </div>
    <div v-else class="lyric-line-sync-editor-no-selected">
      <div style="white-space: pre-line;">
        <i18n-t keypath="lyricSyncEditor.unselectedTip"/>
      </div>
    </div>
    <div class="lyric-line-viewer">
      <DynamicScroller v-slot="{ item, index, active }" :items="lyric.lineWithIds"
                       :min-item-size="lineMinHeight" key-field="id"
                       style="width: 100%; position: relative; min-height: fit-content; height: 100%;">
        <DynamicScrollerItem :active="active" :item="item" watch-data>
          <LyricSyncLine v-if="active" :line="item"/>
        </DynamicScrollerItem>
      </DynamicScroller>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useAudio, useCurrentSyncWord, useDialogs, useEditingLyric, useSettings} from "../store";
import {computed, nextTick, ref} from "vue";
import {storeToRefs} from "pinia";
import LyricSyncLine from "./LyricSyncLine.vue";
import {DynamicScroller, DynamicScrollerItem} from 'vue-virtual-scroller';
import LyricSyncWord from "./LyricSyncWord.vue";
import type {LyricLine, LyricWord} from "../utils/ttml-types";
import {useKeyBinding} from "../utils/keybindings";

const currentWord = useCurrentSyncWord();
const audio = useAudio();
const settings = useSettings();
const dialogs = useDialogs();
const {setCurrentTime} = audio;
const {currentTimeMS} = storeToRefs(audio);
const syncEditor = ref<HTMLDivElement>();
const lyric = useEditingLyric();
const lineMinHeight = computed(getMinHeight);

function getMinHeight() {
  if (settings.showTranslateLine && settings.showRomanLine) {
    return 95;
  } else if (settings.showTranslateLine || settings.showRomanLine) {
    return 66
  } else {
    return 37;
  }
}

function onSyncEditorScroll(evt: WheelEvent) {
  // 默认横向滚动
  syncEditor.value?.scrollBy({
    left: evt.deltaX + evt.deltaY,
    behavior: "auto",
  });
}

currentWord.$subscribe((mut) => {
  const evt = mut.events instanceof Array ? mut.events[0] : mut.events;
  if (evt.key === "wordIndex" && syncEditor.value) {
    const el = syncEditor.value.children.item(currentWord.wordIndex)
    nextTick(() => {
      el?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    })
  }
}, {flush: "post"});

function toTimestamp(duration: number) {
  const isRemainTime = duration < 0;

  const d = Math.abs(duration / 1000);
  const sec = d % 60;
  const min = Math.floor((d - sec) / 60);
  const secFixed = sec.toFixed(3);
  const secText = "0".repeat(6 - secFixed.length) + secFixed;

  return `${isRemainTime ? "-" : ""}${min}:${secText}`;
}

function isBlankWord(lineIndex = currentWord.lineIndex, wordIndex = currentWord.wordIndex) {
  return (lyric.lineWithIds[lineIndex]?.words?.[wordIndex]?.word?.trim()?.length ?? 0) === 0;
}

function isWordExist(lineIndex = currentWord.lineIndex, wordIndex = currentWord.wordIndex) {
  return !!lyric.lyrics[lineIndex]?.words?.[wordIndex];
}

function getCurrentWord(): LyricWord | undefined {
  return lyric.lyrics[currentWord.lineIndex]?.words?.[currentWord.wordIndex];
}

function getCurrentLine(): LyricLine | undefined {
  return lyric.lyrics[currentWord.lineIndex];
}

function moveRight() {
  let lineIndex = currentWord.lineIndex;
  let wordIndex = currentWord.wordIndex;
  if ((getCurrentWord()?.emptyBeat ?? 0) > currentWord.emptyBeat) {
    currentWord.emptyBeat++;
    return false;
  }
  do {
    if (wordIndex < lyric.lineWithIds[lineIndex].words.length - 1) {
      wordIndex++;
    } else if (lineIndex < lyric.lineWithIds.length - 1) {
      wordIndex = 0;
      lineIndex++;
    } else {
      break;
    }
  } while (isWordExist(lineIndex, wordIndex) && isBlankWord(lineIndex, wordIndex));
  if (isWordExist(lineIndex, wordIndex) && !isBlankWord(lineIndex, wordIndex)) {
    currentWord.wordIndex = wordIndex;
    currentWord.lineIndex = lineIndex;
    currentWord.emptyBeat = 0;
  }
  return true;
}

function moveLeft() {
  let lineIndex = currentWord.lineIndex;
  let wordIndex = currentWord.wordIndex;
  if (currentWord.emptyBeat > 0) {
    currentWord.emptyBeat--;
    return false;
  }
  do {
    if (wordIndex > 0) {
      wordIndex--;
    } else if (lineIndex > 0) {
      wordIndex = lyric.lineWithIds[--lineIndex].words.length - 1;
    } else {
      break;
    }
  } while (isWordExist(lineIndex, wordIndex) && isBlankWord(lineIndex, wordIndex));
  if (isWordExist(lineIndex, wordIndex) && !isBlankWord(lineIndex, wordIndex)) {
    currentWord.wordIndex = wordIndex;
    currentWord.lineIndex = lineIndex;
    currentWord.emptyBeat = getCurrentWord()?.emptyBeat ?? 0;
  }
  return true;
}

function moveUp() {
  let lineIndex = currentWord.lineIndex;
  let wordIndex = currentWord.wordIndex;
  do {
    if (lineIndex > 0) {
      lineIndex--;
      wordIndex = 0;
    } else {
      break;
    }
  } while (isWordExist(lineIndex, wordIndex) && isBlankWord(lineIndex, wordIndex));
  if (isWordExist(lineIndex, wordIndex) && !isBlankWord(lineIndex, wordIndex)) {
    currentWord.wordIndex = wordIndex;
    currentWord.lineIndex = lineIndex;
    currentWord.emptyBeat = 0;
  }
}

function moveDown() {
  let lineIndex = currentWord.lineIndex;
  let wordIndex = currentWord.wordIndex;
  do {
    if (lineIndex < lyric.lineWithIds.length - 1) {
      lineIndex++;
      wordIndex = 0;
    } else {
      break;
    }
  } while (isWordExist(lineIndex, wordIndex) && isBlankWord(lineIndex, wordIndex));
  if (isWordExist(lineIndex, wordIndex) && !isBlankWord(lineIndex, wordIndex)) {
    currentWord.wordIndex = wordIndex;
    currentWord.lineIndex = lineIndex;
    currentWord.emptyBeat = 0;
  }
}

useKeyBinding(settings.keybindings.moveLeftWord, () => {
  moveLeft();
});
useKeyBinding(settings.keybindings.moveRightWord, () => {
  moveRight();
});
useKeyBinding(settings.keybindings.moveUpLine, () => {
  moveUp();
});
useKeyBinding(settings.keybindings.moveDownLine, () => {
  moveDown();
});

// 移动到上一个单词，并设置播放位置为目标单词的起始时间
useKeyBinding(settings.keybindings.seekLeftWord, () => {
  if (moveLeft()) {
    const curWord = getCurrentWord();
    if (curWord) setCurrentTime(curWord.startTime);
  }
});
// 移动到下一个单词，并设置播放位置为目标单词的起始时间
useKeyBinding(settings.keybindings.seekRightWord, () => {
  if (moveRight()) {
    const curWord = getCurrentWord();
    if (curWord) setCurrentTime(curWord.startTime);
  }
});
// 记录当前时间为当前单词的起始时间
useKeyBinding(settings.keybindings.setCurWordStartTime, () => {
  const curWord = getCurrentWord();
  if (curWord) {
    curWord.startTime = currentTimeMS.value;
    if ((curWord.emptyBeat ?? 0) > 0) currentWord.emptyBeat = 1;
    const currentLine = getCurrentLine();
    if (currentWord.wordIndex === 0 && currentLine) {
      currentLine.startTime = currentTimeMS.value;
    }
    lyric.record();
  }
});

function stepWordAndSetTime() {
  const curWord = getCurrentWord();
  const currentLine = getCurrentLine();
  const curWordIndex = currentWord.wordIndex;
  if (moveRight()) {
    let shouldRecord = false;
    if (curWord) {
      curWord.endTime = currentTimeMS.value;
      shouldRecord = true;
      if (currentLine && curWordIndex === currentLine.words.length - 1) {
        currentLine.endTime = curWord.endTime;
      }
    }
    const nextWord = getCurrentWord();
    if (nextWord) {
      nextWord.startTime = currentTimeMS.value;
      shouldRecord = true;
      const currentLine = getCurrentLine();
      if (currentLine && currentWord.wordIndex === 0) {
        currentLine.startTime = nextWord.startTime;
      }
    }
    if (shouldRecord) {
      lyric.record();
    }
  }
}

// 记录当前时间为当前单词的结束时间和下一个单词的起始时间，并移动到下一个单词
useKeyBinding(settings.keybindings.stepWordAndSetTime, () => {
  stepWordAndSetTime();
});
useKeyBinding(settings.keybindings.stepWordAndSetTimeAlias1, () => {
  stepWordAndSetTime();
});
useKeyBinding(settings.keybindings.stepWordAndSetTimeAlias2, () => {
  stepWordAndSetTime();
});
useKeyBinding(settings.keybindings.stepWordAndSetTimeAlias3, () => {
  stepWordAndSetTime();
});
// 记录当前时间为当前单词的结束时间，并移动到下一个单词（用于空出间奏时间）
useKeyBinding(settings.keybindings.stepWordAndSetEndTime, () => {
  const curWord = getCurrentWord();
  const currentLine = getCurrentLine();
  const curWordIndex = currentWord.wordIndex;
  if (moveRight()) {
    if (curWord) {
      curWord.endTime = currentTimeMS.value;
      if (currentLine && curWordIndex === currentLine.words.length - 1) {
        currentLine.endTime = curWord.endTime;
      }
      lyric.record();
    }
  }
});

</script>

<style lang="sass">
.lyric-sync-editor
  display: flex
  flex-direction: column
  height: 100%
  max-height: 100%
  overflow: hidden

.lyric-line-sync-editor-no-selected
  flex: 1
  align-self: center
  justify-content: center
  align-items: center
  overflow: hidden
  max-width: 100%
  min-height: 128px
  display: flex
  text-align: center

.lyric-line-sync-editor
  flex: 1
  align-self: center
  overflow: auto hidden
  max-width: 100%
  min-height: 128px
  display: flex
  align-items: stretch
  padding: 0 32px
  white-space: nowrap

  > *
    display: grid
    grid-template: "emptyBeat emptyBeat" "selectMark selectMark" "selectArrow selectArrow" "word word" "startTime endTime"
    align-content: center
    border-left: 1px solid #AAA4
    padding: 0 12px
    user-select: none
    cursor: pointer

    &:first-child
      border-left: none

    > *:nth-child(1)
      grid-area: word
      font-size: 32px
      text-align: center

    > *:nth-child(2)
      grid-area: startTime
      font-size: 12px
      text-align: left

    > *:nth-child(3)
      grid-area: endTime
      margin-left: 8px
      font-size: 12px
      text-align: right

    > *:nth-child(4)
      grid-area: selectMark
      font-size: 12px
      text-align: center
      color: var(--att-theme-color)
      font-weight: bold

    > *:nth-child(5)
      grid-area: selectArrow
      align-self: center
      justify-self: center
      content: ""
      width: 0
      height: 0
      margin-bottom: 8px
      border-left: 4px solid transparent
      border-right: 4px solid transparent
      border-top: 4px solid var(--att-theme-color)

    > *:nth-child(6)
      grid-area: emptyBeat
      font-size: 12px
      text-align: center
      color: var(--att-theme-color)
      font-weight: bold

.word-selected
  grid-area: selectMark

.lyric-line-viewer
  flex: 5
  position: relative
  align-self: stretch
  min-height: 0
  overflow: hidden auto
</style>
