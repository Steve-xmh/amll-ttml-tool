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
