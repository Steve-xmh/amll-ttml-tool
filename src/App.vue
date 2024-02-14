<!--
  - Copyright 2023-2024 Steve Xiao (stevexmh@qq.com) and contributors.
  -
  - 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
  - This source code file is a part of AMLL TTML Tool project.
  - 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
  - Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
  -
  - https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
  -->

<template>
	<NGlobalStyle/>
	<NLayout :style="{
                '--att-theme-color': themeVars.primaryColorSuppl,
                '--att-theme-color-hover': themeVars.primaryColorHover,
                '--att-theme-color-pressed': themeVars.primaryColorPressed,
                '--att-border-color': themeVars.borderColor,
                '--att-divider-color': themeVars.dividerColor,
                '--att-height-medium': themeVars.heightMedium,
            }" content-style="display: flex; flex-direction: column;" position="absolute">
		<TopBar/>
		<NLayoutContent style="flex: 1">
			<Suspense v-if="edit.editMode === 'edit'">
				<LyricEditor/>
				<template #fallback>
					<div
						style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px">
						<NSpin/>
						<div>
							<i18n-t keypath="app.loadingEditPage"/>
						</div>
					</div>
				</template>
			</Suspense>
			<Suspense v-else-if="edit.editMode === 'sync'">
				<LyricSyncEditor/>
				<template #fallback>
					<div
						style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px">
						<NSpin/>
						<div>
							<i18n-t keypath="app.loadingSyncPage"/>
						</div>
					</div>
				</template>
			</Suspense>
			<Suspense v-else-if="edit.editMode === 'amll-preview'">
				<AMLLPreviewView/>
				<template #fallback>
					<div
						style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px">
						<NSpin/>
						<div>
							<i18n-t keypath="app.loadingAMLLPreviewPage"/>
						</div>
					</div>
				</template>
			</Suspense>
		</NLayoutContent>
		<AudioPlayerBar/>
	</NLayout>
	<ContextMenu/>
	<TutorialModal/>
	<ProgressOverlay/>
	<UploadDBDialog/>
	<ImportPlainTextModal/>
	<ImportFromDBDialog/>
	<MetadataDialog/>
	<SettingsModal/>
	<SplitWordModal/>
	<ServiceWorkerUpdater v-if="enableSW"/>
	<!-- <SplitWordModal /> -->
</template>

<script lang="ts" setup>
import {NGlobalStyle, NLayout, NLayoutContent, NSpin, useNotification, useThemeVars,} from "naive-ui";
import {defineAsyncComponent, onErrorCaptured, onMounted, Suspense} from "vue";
import {useEditMode} from "./store";
import ProgressOverlay from "./components/modals/ProgressOverlay.vue";
import AudioPlayerBar from "./components/AudioPlayerBar.vue";
import TutorialModal from "./components/modals/TutorialModal.vue";
import TopBar from "./components/TopBar.vue";
import ContextMenu from "./components/ContextMenu.vue";
import UploadDBDialog from "./components/modals/UploadDBDialog.vue";
import ImportFromDBDialog from "./components/modals/ImportFromDBDialog.vue";
import ServiceWorkerUpdater from "./components/ServiceWorkerUpdater.vue";
import ImportPlainTextModal from "./components/modals/ImportPlainTextModal.vue";
import {useI18n} from "vue-i18n";
import MetadataDialog from "./components/modals/MetadataDialog.vue";
import SettingsModal from "./components/modals/SettingsModal.vue";
import SplitWordModal from "./components/modals/SplitWordModal.vue";

const LyricEditor = defineAsyncComponent(() => import("./components/LyricEditor.vue"));
const LyricSyncEditor = defineAsyncComponent(() => import("./components/LyricSyncEditor.vue"));
const AMLLPreviewView = defineAsyncComponent(() => import("./components/AMLLPreviewView.vue"));

const themeVars = useThemeVars();
const edit = useEditMode();
const enableSW = !!import.meta.env.TAURI_PLATFORM;
const notify = useNotification();
const i18n = useI18n({useScope: "global"});

onErrorCaptured((err) => {
	notify.error({
		title: i18n.t("runtimeError.title"),
		content: i18n.t("runtimeError.content", [String(err.stack ?? err)]),
	});
	return false;
});

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
