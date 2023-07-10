<template>
    <NModal preset="card" :closable="!submitData.processing" @close="dialogs.submitLyric = false"
        :show="dialogs.submitLyric" transform-origin="center" style="max-width: 600px;" title="提交歌词到 AMLL 歌词数据库">
        <NSpace vertical>
            <div>首先，感谢您的慷慨歌词贡献！</div>
            <div>通过提交，你将默认同意<b>使用 CC0 共享协议完全放弃歌词所有权</b>并提交到歌词数据库！</div>
            <div>并且歌词将会在以后被 AMLL 插件作为默认 TTML 歌词源获取！</div>
            <div>如果您对歌词所有权比较看重的话，请勿提交歌词哦！</div>
            <div>请输入以下提交信息然后跳转到 Github 议题提交页面！</div>
            <h4>歌曲名称</h4>
            <NInput :loading="submitData.processing" :disabled="submitData.processing" v-model:value="submitData.name"
                placeholder="歌曲名称" />
            <div>推荐使用 歌手 - 歌曲 格式，方便仓库管理员确认你的歌曲是否存在</div>
            <h4>音乐对应的网易云音乐 ID</h4>
            <NInput :loading="submitData.processing" :disabled="submitData.processing" v-model:value="submitData.ids"
                placeholder="音乐对应的网易云音乐 ID" />
            <div>
                <div>可以通过在 AMLL 插件内右键复制音乐 ID 得到，应该都是纯数字</div>
                <div>如果需要同时提交到多个歌曲上，可以以英文逗号分隔 ID</div>
            </div>
            <h4>提交缘由</h4>
            <NRadio :checked="submitData.submitReason === '新歌词提交'" value="新歌词提交" @click="submitData.submitReason = '新歌词提交'">
                新歌词提交</NRadio>
            <NRadio :checked="submitData.submitReason === '修正已有歌词'" value="修正已有歌词"
                @click="submitData.submitReason = '修正已有歌词'">修正已有歌词</NRadio>
            <h4>备注</h4>
            <NInput :loading="submitData.processing" :disabled="submitData.processing" v-model:value="submitData.comment"
                placeholder="备注" />
            <div>有什么需要补充说明的呢？</div>
        </NSpace>
        <template #footer>
            <NButton :disabled="submitData.processing || !submitData.name || !submitData.ids || lyric.lyrics.length === 0"
                type="primary" @click="uploadAndSubmit">上传并跳转提交</NButton>
            <NText v-if="lyric.lyrics.length === 0" style="margin-left: 12px" type="error">歌词还什么都没有呢？</NText>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { NModal, NText, NInput, NRadio, NSpace, NButton, useNotification } from 'naive-ui';
import { useEditingLyric, useDialogs } from '../store';
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
