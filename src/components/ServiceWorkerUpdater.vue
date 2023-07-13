<template></template>

<script setup lang="ts">
import {
    NButton,
    useNotification,
} from "naive-ui";
import { onMounted, h } from "vue";
import { registerSW } from "virtual:pwa-register";

const notify = useNotification();

onMounted(async () => {
    const updateSW = registerSW({
        onNeedRefresh() {
            const n = notify.info({
                title: "编辑器已更新！",
                content: "请点击更新按钮以更新编辑器！",
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
                        default: () => "更新"
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
