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
    <NModal preset="card" @close="dialogs.editLyricInfo = false"
        :show="dialogs.editLyricInfo" transform-origin="center" style="max-width: 600px;" title="歌词文件信息">
        <NSpace vertical>
            
        </NSpace>
        <template #footer>
            <NButton><i18n-t keypath="lyricInfoModal.saveBtn" /></NButton>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { NModal, NText, NInput, NRadio, NSpace, NButton, useNotification } from 'naive-ui';
import { useEditingLyric, useDialogs } from '../../store';
import { reactive } from "vue";

const lyric = useEditingLyric();
const notify = useNotification();
const dialogs = useDialogs();

</script>
