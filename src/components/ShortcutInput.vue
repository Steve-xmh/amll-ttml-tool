<template>
	<NInput :clearable="!!props.default" :placeholder="t('shortcutInput.recording')"
		:value="isRecording ? '' : formatted" @blur="onBlur" @clear="onReset" @focus="onFocus">
		<template #clear-icon>
			<NIcon>
				<ArrowReset24Regular />
			</NIcon>
		</template>
	</NInput>
</template>

<script lang="ts" setup>
import structuredClone from "@ungap/structured-clone";
import { ArrowReset24Regular } from "@vicons/fluent";
import { NIcon, NInput } from "naive-ui";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { KeyBindingsConfig } from "../utils/keybindings";
import {
	formatKeyBindings,
	recordShortcut,
	stopRecordingShortcut,
} from "../utils/keybindings";

const model = defineModel<KeyBindingsConfig>();
const props = defineProps<{
	default?: KeyBindingsConfig;
}>();
const { t } = useI18n({ useScope: "global" });

const isRecording = ref(false);
const formatted = computed(
	() => formatKeyBindings(model.value ?? []) || t("shortcutInput.none"),
);

async function onFocus() {
	stopRecordingShortcut();
	isRecording.value = true;
	try {
		model.value = await recordShortcut();
	} catch { }
	isRecording.value = false;
}

function onBlur() {
	stopRecordingShortcut();
	isRecording.value = false;
}

function onReset() {
	if (props.default)
		model.value = (window.structuredClone || structuredClone)(props.default);
	isRecording.value = false;
}
</script>

<style lang="css" scoped></style>
