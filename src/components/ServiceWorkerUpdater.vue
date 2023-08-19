<template></template>

<script setup lang="ts">
import {
    NButton,
    useNotification,
} from "naive-ui";
import { onMounted, h } from "vue";
import { i18n } from '../i18n';
import { registerSW } from "virtual:pwa-register";

const notify = useNotification();

onMounted(async () => {
    const updateSW = registerSW({
        onNeedRefresh() {
            const n = notify.info({
                title: i18n.global.t("serviceWorkerUpdater.needRefresh.title"),
                content: i18n.global.t("serviceWorkerUpdater.needRefresh.content"),
                action: () => h(
                    NButton,
                    {
                        text: true,
                        type: "primary",
                        onClick: () => {
                            n.destroy();
                            updateSW();
                        }
                    },
                    {
                        default: () => i18n.global.t("serviceWorkerUpdater.needRefresh.updateBtn"),
                    }
                )
            });
        },
        onOfflineReady() {
            notify.success({
                title: "编辑器已完成离线缓存！",
                content: "现在开始不需要网络也可以访问编辑器了！",
            });
        },
    });
});
</script>
