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
                    <LyricEditor v-if="edit.editMode === 'edit'" />
                    <LyricSyncEditor v-else-if="edit.editMode === 'sync'" />
                </NLayoutContent>
                <AudioPlayerBar />
            </NLayout>
            <ContextMenu />
            <TutorialModal />
            <ProgressOverlay />
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
} from "naive-ui";
import { onMounted } from "vue";
import { useEditMode } from "./store";
import LyricEditor from "./components/LyricEditor.vue";
import ProgressOverlay from "./components/ProgressOverlay.vue";
import LyricSyncEditor from "./components/LyricSyncEditor.vue";
import AudioPlayerBar from "./components/AudioPlayerBar.vue";
import TutorialModal from "./components/TutorialModal.vue";
import TopBar from "./components/TopBar.vue";
import ContextMenu from "./components/ContextMenu.vue";

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