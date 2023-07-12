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
                            <NSpin>
                                <div></div>
                            </NSpin>
                        </template>
                    </Suspense>
                    <Suspense v-else-if="edit.editMode === 'sync'">
                        <LyricSyncEditor />
                        <template #fallback>
                            <NSpin>
                                <div></div>
                            </NSpin>
                        </template>
                    </Suspense>
                </NLayoutContent>
                <AudioPlayerBar />
            </NLayout>
            <ContextMenu />
            <TutorialModal />
            <ProgressOverlay />
            <UploadDBDialog />
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
import ProgressOverlay from "./components/ProgressOverlay.vue";
import AudioPlayerBar from "./components/AudioPlayerBar.vue";
import TutorialModal from "./components/TutorialModal.vue";
import TopBar from "./components/TopBar.vue";
import ContextMenu from "./components/ContextMenu.vue";
import UploadDBDialog from "./components/UploadDBDialog.vue";
const LyricEditor = defineAsyncComponent(() => import("./components/LyricEditor.vue"));
const LyricSyncEditor = defineAsyncComponent(() => import("./components/LyricSyncEditor.vue"));

const themeVars = useThemeVars();
const edit = useEditMode();

onMounted(() => {
    // ask before page close
    window.addEventListener("beforeunload", evt => {
        evt.preventDefault();
        return evt.returnValue = "";
    })
});
</script>