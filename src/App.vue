<template>
    <NConfigProvider useOsTheme>
        <NNotificationProvider>
            <NGlobalStyle />
            <NLayout position="absolute" :style="{
                '--att-theme-color': themeVars.primaryColorSuppl,
                '--att-theme-color-hover': themeVars.primaryColorHover,
                '--att-theme-color-pressed': themeVars.primaryColorPressed,
                '--att-border-color': themeVars.borderColor,
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
    NNotificationProvider,
    NSpin,
} from "naive-ui";
import { onMounted, Suspense, defineAsyncComponent } from "vue";
import { useEditMode } from "./store";
import ProgressOverlay from "./components/modals/ProgressOverlay.vue";
import AudioPlayerBar from "./components/AudioPlayerBar.vue";
import TutorialModal from "./components/modals/TutorialModal.vue";
import TopBar from "./components/TopBar.vue";
import ContextMenu from "./components/ContextMenu.vue";
import UploadDBDialog from "./components/modals/UploadDBDialog.vue";
import SplitWordModal from "./components/modals/SplitWordModal.vue";
import ServiceWorkerUpdater from "./components/ServiceWorkerUpdater.vue";
import ImportPlainTextModal from "./components/modals/ImportPlainTextModal.vue";
const LyricEditor = defineAsyncComponent(() => import("./components/LyricEditor.vue"));
const LyricSyncEditor = defineAsyncComponent(() => import("./components/LyricSyncEditor.vue"));
const AMLLPreviewView = defineAsyncComponent(() => import("./components/AMLLPreviewView.vue"));

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