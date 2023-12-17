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
    <NConfigProvider :theme="theme">
        <NNotificationProvider>
            <NGlobalStyle />
            <NLayout position="absolute" :style="{
                '--att-theme-color': themeVars.primaryColorSuppl,
                '--att-theme-color-hover': themeVars.primaryColorHover,
                '--att-theme-color-pressed': themeVars.primaryColorPressed,
                '--att-border-color': themeVars.borderColor,
                '--att-divider-color': themeVars.dividerColor,
                '--att-height-medium': themeVars.heightMedium,
            }" content-style="display: flex; flex-direction: column;">
                <TopBar />
                <NLayoutContent style="flex: 1">
                    <Suspense v-if="edit.editMode === 'edit'">
                        <LyricEditor />
                        <template #fallback>
                            <div
                                style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px">
                                <NSpin />
                                <div><i18n-t keypath="app.loadingEditPage" /></div>
                            </div>
                        </template>
                    </Suspense>
                    <Suspense v-else-if="edit.editMode === 'sync'">
                        <LyricSyncEditor />
                        <template #fallback>
                            <div
                                style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px">
                                <NSpin />
                                <div><i18n-t keypath="app.loadingSyncPage" /></div>
                            </div>
                        </template>
                    </Suspense>
                    <Suspense v-else-if="edit.editMode === 'amll-preview'">
                        <AMLLPreviewView />
                        <template #fallback>
                            <div
                                style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px">
                                <NSpin />
                                <div><i18n-t keypath="app.loadingAMLLPreviewPage" /></div>
                            </div>
                        </template>
                    </Suspense>
                </NLayoutContent>
                <AudioPlayerBar />
            </NLayout>
            <ContextMenu />
            <TutorialModal />
            <ProgressOverlay />
            <UploadDBDialog />
            <ImportPlainTextModal />
            <ImportFromDBDialog />
            <ServiceWorkerUpdater v-if="enableSW" />
            <!-- <SplitWordModal /> -->
        </NNotificationProvider>
    </NConfigProvider>
</template>

<script setup lang="ts">
import {
    NLayout,
    NLayoutContent,
    NConfigProvider,
    NGlobalStyle,
    useThemeVars,
    useOsTheme,
    NNotificationProvider,
    NSpin,
    darkTheme,
} from "naive-ui";
import { onMounted, Suspense, defineAsyncComponent, computed } from "vue";
import { useEditMode } from "./store";
import ProgressOverlay from "./components/modals/ProgressOverlay.vue";
import AudioPlayerBar from "./components/AudioPlayerBar.vue";
import TutorialModal from "./components/modals/TutorialModal.vue";
import TopBar from "./components/TopBar.vue";
import ContextMenu from "./components/ContextMenu.vue";
import UploadDBDialog from "./components/modals/UploadDBDialog.vue";
import ImportFromDBDialog from "./components/modals/ImportFromDBDialog.vue";
import SplitWordModal from "./components/modals/SplitWordModal.vue";
import ServiceWorkerUpdater from "./components/ServiceWorkerUpdater.vue";
import ImportPlainTextModal from "./components/modals/ImportPlainTextModal.vue";
const LyricEditor = defineAsyncComponent(() => import("./components/LyricEditor.vue"));
const LyricSyncEditor = defineAsyncComponent(() => import("./components/LyricSyncEditor.vue"));
const AMLLPreviewView = defineAsyncComponent(() => import("./components/AMLLPreviewView.vue"));

const osThemeRef = useOsTheme();
const theme = computed(() => osThemeRef.value === "dark" ? darkTheme : undefined);
const themeVars = useThemeVars();
const edit = useEditMode();
const enableSW = !!import.meta.env.TAURI_PLATFORM;

onMounted(() => {
    // ask before page close
    if (!import.meta.env.DEV) {
        window.addEventListener("beforeunload", evt => {
            evt.preventDefault();
            return evt.returnValue = "";
        })
    }
});
</script>
