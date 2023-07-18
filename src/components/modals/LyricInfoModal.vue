<template>
    <NModal preset="card" @close="dialogs.editLyricInfo = false"
        :show="dialogs.editLyricInfo" transform-origin="center" style="max-width: 600px;" title="歌词文件信息">
        <NSpace vertical>
            
        </NSpace>
        <template #footer>
            <NButton>保存</NButton>
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
