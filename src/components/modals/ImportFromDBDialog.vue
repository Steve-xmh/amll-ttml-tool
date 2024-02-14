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
	<NModal :show="dialogs.importFromDB" :title="t('importFromAMLLDB.title')" preset="card" style="max-width: 400px;"
			transform-origin="center" @close="dialogs.importFromDB = false">
		<NSpace vertical>
			<NAlert type="warning">
				<i18n-t keypath="importFromAMLLDB.description"/>
			</NAlert>
			<NInputNumber v-model:value="musicId" :disabled="importing" :placeholder="t('importFromAMLLDB.musicID.placeholder')"
						  :show-button="false"/>
		</NSpace>
		<template #action>
			<NButton :loading="importing" @click="onImport">
				<i18n-t keypath="importFromAMLLDB.importBtn"/>
			</NButton>
		</template>
	</NModal>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useDialogs, useEditingLyric} from "../../store";
import {NAlert, NButton, NInputNumber, NModal, NSpace, useNotification} from "naive-ui";
import {useI18n} from "vue-i18n";
import {parseLyric} from "../../utils/ttml-parser";

const musicId = ref(0);
const editingLyric = useEditingLyric();
const importing = ref(false);
const notify = useNotification();
const dialogs = useDialogs();
const {t} = useI18n({useScope: "global"});

async function onImport() {
	importing.value = true;
	const id = musicId.value;
	try {
		// https://raw.githubusercontent.com/Steve-xmh/amll-ttml-db/main/lyrics/[MUSIC_ID].ttml
		const res = await fetch(`https://raw.githubusercontent.com/Steve-xmh/amll-ttml-db/main/lyrics/${id}.ttml`);
		if (res.status === 200) {
			const ttml = await res.text();
			editingLyric.loadLyric(parseLyric(ttml));
			notify.success({
				title: "歌词导入成功！",
				duration: 3000,
			});
			dialogs.importFromDB = false;
		} else {
			notify.error({
				title: `导入 ID 为 ${id} 的歌词失败`,
				content: "请求返回的响应状态码不成功，歌词文件可能不存在",
				duration: 3000,
			});
		}
	} catch (err) {
		notify.error({
			title: `导入 ID 为 ${id} 的歌词失败`,
			content: `${err}`,
			duration: 5000,
		});
	}
	importing.value = false;
}

</script>
