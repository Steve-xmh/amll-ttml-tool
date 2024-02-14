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
	<NModal :closable="!submitData.processing" :show="dialogs.submitLyric" :title="t('splitWordModal.title')"
			preset="card" style="max-width: 600px;" transform-origin="center"
			@close="dialogs.submitLyric = false">
		<NSpace vertical>

		</NSpace>
		<template #footer>
			<NButton
				:disabled="submitData.processing || !submitData.name || !submitData.ids || lyric.lyrics.length === 0"
				type="primary" @click="uploadAndSubmit">
				<i18n-t keypath="splitWordModal.splitBtn"/>
			</NButton>
		</template>
	</NModal>
</template>

<script setup lang="ts">
import {NButton, NModal, NSpace, useNotification} from 'naive-ui';
import {useDialogs, useEditingLyric} from '../../store';
import {reactive} from "vue";
import {useI18n} from "vue-i18n";

const lyric = useEditingLyric();
const notify = useNotification();
const dialogs = useDialogs();
const {t} = useI18n({useScope: "global"});

const submitData = reactive({
	name: "",
	ids: "",
	submitReason: "新歌词提交",
	comment: "",
	processing: false,
});

async function uploadAndSubmit() {
	if (submitData.processing) return;
	submitData.processing = true;
	try {
		const lyricData = encodeURIComponent(lyric.toTTML());
		const lyricUrl = await fetch("https://dpaste.org/api/", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: "format=url&lexer=xml&expires=3600&filename=lyric.ttml&content=" + lyricData
		}).then(v => v.text()).then(v => v.trim() + "/raw");
		const issueUrl = new URL("https://github.com/Steve-xmh/amll-ttml-db/issues/new");
		issueUrl.searchParams.append("labels", "歌词提交/补正");
		issueUrl.searchParams.append("template", "submit-lyric.yml");
		issueUrl.searchParams.append("title", "[歌词提交/修正] " + submitData.name);
		issueUrl.searchParams.append("song-name", submitData.name);
		issueUrl.searchParams.append("song-id", submitData.ids);
		issueUrl.searchParams.append("ttml-download-url", lyricUrl);
		issueUrl.searchParams.append("upload-reason", submitData.submitReason);
		issueUrl.searchParams.append("comment", submitData.comment);
		open(issueUrl.toString());
	} catch (err) {
		console.warn("提交失败", err);
		notify.error({
			title: "歌词提交失败！",
			content: `错误原因：\n${err}`,
		});
	}
	submitData.processing = false;
}

</script>
