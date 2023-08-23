<template>
    <NModal preset="card" :closable="!submitData.processing" @close="dialogs.submitLyric = false"
        :show="dialogs.submitLyric" transform-origin="center" style="max-width: 600px;" :title="t('uploadDBDialog.title')">
        <NSpace vertical style="line-height: 2rem; white-space: pre-line;">
            <NAlert type="warning">
                <i18n-t keypath="uploadDBDialog.ncmOnlyWarning" />
            </NAlert>
            <i18n-t keypath="uploadDBDialog.content">
                <b v-t="'uploadDBDialog.boldCC0'"></b>
            </i18n-t>
            <h4>
                <i18n-t keypath="uploadDBDialog.musicName" />
            </h4>
            <NInput :loading="submitData.processing" :disabled="submitData.processing" v-model:value="submitData.name"
                :placeholder="t('uploadDBDialog.musicNamePlaceholder')" />
            <div>
                <i18n-t keypath="uploadDBDialog.musicNameTip" />
            </div>
            <h4>
                <i18n-t keypath="uploadDBDialog.ncmID" />
            </h4>
            <NInput :loading="submitData.processing" :disabled="submitData.processing" v-model:value="submitData.ids"
                :placeholder="t('uploadDBDialog.ncmIDPlaceholder')" />
            <div>
                <i18n-t keypath="uploadDBDialog.ncmIDTip" />
            </div>
            <h4><i18n-t keypath="uploadDBDialog.uploadReason.label" /></h4>
            <NRadio :checked="submitData.submitReason === '新歌词提交'" value="新歌词提交" @click="submitData.submitReason = '新歌词提交'">
                <i18n-t keypath="uploadDBDialog.uploadReason.newLyric" />
            </NRadio>
            <NRadio :checked="submitData.submitReason === '修正已有歌词'" value="修正已有歌词"
                @click="submitData.submitReason = '修正已有歌词'"><i18n-t keypath="uploadDBDialog.uploadReason.patchLyric" />
            </NRadio>
            <h4>
                <i18n-t keypath="uploadDBDialog.comment" />
            </h4>
            <NInput :loading="submitData.processing" :disabled="submitData.processing" v-model:value="submitData.comment"
                :placeholder="t('uploadDBDialog.commentPlaceholder')" />
            <div><i18n-t keypath="uploadDBDialog.commentTip" /></div>
        </NSpace>
        <template #footer>
            <NButton :disabled="submitData.processing || !submitData.name || !submitData.ids || lyric.lyrics.length === 0"
                type="primary" @click="uploadAndSubmit"><i18n-t keypath="uploadDBDialog.uploadBtn" /></NButton>
            <NText v-if="lyric.lyrics.length === 0" style="margin-left: 12px" type="error">
                <i18n-t keypath="uploadDBDialog.errors.noLyricContent" />
            </NText>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { NModal, NText, NInput, NRadio, NSpace, NButton, NAlert, useNotification } from 'naive-ui';
import { useEditingLyric, useDialogs } from '../../store';
import { reactive } from "vue";
import { useI18n } from "vue-i18n";

const lyric = useEditingLyric();
const notify = useNotification();
const dialogs = useDialogs();
const { t } = useI18n({ useScope: "global" });

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
        console.warn("Submit failed", err);
        notify.error({
            title: t("uploadDBDialog.errorNotification.title"),
            content: t("uploadDBDialog.errorNotification.content", [err]),
        });
    }
    submitData.processing = false;
}

</script>
