<template>
    <NModal preset="card" :closable="!submitData.processing" @close="dialogs.submitLyric = false"
        :show="dialogs.submitLyric" transform-origin="center" style="max-width: 600px;" :title="$t('splitWordModal.title')">
        <NSpace vertical>

        </NSpace>
        <template #footer>
            <NButton :disabled="submitData.processing || !submitData.name || !submitData.ids || lyric.lyrics.length === 0"
                type="primary" @click="uploadAndSubmit"><i18n-t keypath="splitWordModal.splitBtn" /></NButton>
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

const submitData = reactive({
    name: "",
    ids: "",
    submitReason: "新歌词提交",
    comment: "",
    processing: false,
});

async function uploadAndSubmit() {
    if (submitData.processing) return;
    submitData.processing = true;
    try {
        const lyricData = encodeURIComponent(lyric.toTTML());
        const lyricUrl = await fetch("https://dpaste.org/api/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "format=url&lexer=xml&expires=3600&filename=lyric.ttml&content=" + lyricData
        }).then(v => v.text()).then(v => v.trim() + "/raw");
        const issueUrl = new URL("https://github.com/Steve-xmh/amll-ttml-db/issues/new");
        issueUrl.searchParams.append("labels", "歌词提交/补正");
        issueUrl.searchParams.append("template", "submit-lyric.yml");
        issueUrl.searchParams.append("title", "[歌词提交/修正] " + submitData.name);
        issueUrl.searchParams.append("song-name", submitData.name);
        issueUrl.searchParams.append("song-id", submitData.ids);
        issueUrl.searchParams.append("ttml-download-url", lyricUrl);
        issueUrl.searchParams.append("upload-reason", submitData.submitReason);
        issueUrl.searchParams.append("comment", submitData.comment);
        open(issueUrl.toString());
    } catch (err) {
        console.warn("提交失败", err);
        notify.error({
            title: "歌词提交失败！",
            content: `错误原因：\n${err}`,
        });
    }
    submitData.processing = false;
}

</script>
