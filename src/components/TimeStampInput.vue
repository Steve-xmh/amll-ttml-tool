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
	<NInput v-model:value="curTimeStamp" :status="isValueValid ? undefined : 'error'" placeholder="0:00.000"
		@blur="onBlur" />
</template>

<script lang="ts" setup>
import { NInput } from "naive-ui";
import { computed, onMounted, ref, watchEffect } from "vue";
import { msToTimestamp, parseTimespan } from "../utils/timestamp";

const model = defineModel<number>("value");
const emit = defineEmits<{
	"update:modelValue": [value: number];
}>();
const curTimeStamp = ref<string>("");

const isValueValid = computed(() => {
	try {
		parseTimespan(curTimeStamp.value);
		return true;
	} catch {
		return false;
	}
});

function updateFromModel() {
	if (model.value !== undefined) {
		try {
			curTimeStamp.value = msToTimestamp(model.value);
		} catch {
			curTimeStamp.value = "";
		}
	}
}

onMounted(updateFromModel);
watchEffect(updateFromModel);

function onBlur() {
	try {
		const newValue = parseTimespan(curTimeStamp.value);
		const changed = newValue !== model.value;
		model.value = newValue;
		curTimeStamp.value = msToTimestamp(model.value);
		if (changed) emit("update:modelValue", model.value);
	} catch {
		updateFromModel();
	}
}
</script>

<style lang="css" scoped></style>
