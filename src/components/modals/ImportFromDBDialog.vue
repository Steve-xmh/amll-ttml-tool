<template>
    <NModal preset="card" @close="dialogs.importFromDB = false" :show="dialogs.importFromDB" transform-origin="center"
        style="max-width: 400px;" :title="t('importFromAMLLDB.title')">
        <NSpace vertical>
        <NAlert type="warning">
            <i18n-t keypath="importFromAMLLDB.description" />
        </NAlert>
        <NInputNumber v-model:value="musicId" :disabled="importing" :show-button="false" :placeholder="t('importFromAMLLDB.musicID.placeholder')" />
        </NSpace>
        <template #action>
            <NButton @click="onImport" :loading="importing">
                <i18n-t keypath="importFromAMLLDB.importBtn" />
            </NButton>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDialogs, useEditingLyric } from "../../store";
import { NModal, NInputNumber, NAlert, NButton, NSpace, useNotification } from "naive-ui";
import { useI18n } from "vue-i18n";
import { parseLyric } from "../../utils/ttml-lyric-parser";

const musicId = ref(0);
const editingLyric = useEditingLyric();
const importing = ref(false);
const notify = useNotification();
const dialogs = useDialogs();
const { t } = useI18n({ useScope: "global" });

async function onImport() {
    importing.value = true;
    const id = musicId.value;
    try {
        // https://raw.githubusercontent.com/Steve-xmh/amll-ttml-db/main/lyrics/[MUSIC_ID].ttml
        const res = await fetch(`https://raw.githubusercontent.com/Steve-xmh/amll-ttml-db/main/lyrics/${id}.ttml`);
        if (res.status === 200) {
            const ttml = await res.text();
            editingLyric.loadLyric(parseLyric(ttml));
            notify.success({
                title: "歌词导入成功！",
                duration: 3000,
            });
            dialogs.importFromDB = false;
        } else {
            notify.error({
                title: `导入 ID 为 ${id} 的歌词失败`,
                content: "请求返回的响应状态码不成功，歌词文件可能不存在",
                duration: 3000,
            });
        }
    } catch (err) {
        notify.error({
            title: `导入 ID 为 ${id} 的歌词失败`,
            content: `${err}`,
            duration: 5000,
        });
    }
    importing.value = false;
}

</script>