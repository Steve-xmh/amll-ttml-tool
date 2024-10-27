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
	<NModal :closable="!submitData.processing" :show="dialogs.submitLyric" :title="t('uploadDBDialog.title')"
		preset="card" style="max-width: 600px;" transform-origin="center" @close="dialogs.submitLyric = false">
		<NSpace style="line-height: 2rem; white-space: pre-line;" vertical>
			<NAlert type="warning">
				<i18n-t keypath="uploadDBDialog.chineseUserOnlyWarning" />
			</NAlert>
			<i18n-t keypath="uploadDBDialog.content">
				<b v-t="'uploadDBDialog.boldCC0'"></b>
			</i18n-t>
			<h4>
				<i18n-t keypath="uploadDBDialog.musicName" />
			</h4>
			<NCheckbox v-model:checked="submitData.generateMusicNameFromMetadata"
				:label="t('uploadDBDialog.generateFromMetadata')" />
			<NInput v-model:value="submitData.name"
				:disabled="submitData.processing || submitData.generateMusicNameFromMetadata"
				:loading="submitData.processing" :placeholder="t('uploadDBDialog.musicNamePlaceholder')" />
			<div>
				<i18n-t keypath="uploadDBDialog.musicNameTip" />
			</div>
			<h4>
				<i18n-t keypath="uploadDBDialog.uploadReason.label" />
			</h4>
			<NRadio :checked="submitData.submitReason === '新歌词提交'" value="新歌词提交"
				@click="submitData.submitReason = '新歌词提交'">
				<i18n-t keypath="uploadDBDialog.uploadReason.newLyric" />
			</NRadio>
			<NRadio :checked="submitData.submitReason === '修正已有歌词'" value="修正已有歌词"
				@click="submitData.submitReason = '修正已有歌词'">
				<i18n-t keypath="uploadDBDialog.uploadReason.patchLyric" />
			</NRadio>
			<h4>
				<i18n-t keypath="uploadDBDialog.comment" />
			</h4>
			<NInput v-model:value="submitData.comment" :disabled="submitData.processing"
				:loading="submitData.processing" :placeholder="t('uploadDBDialog.commentPlaceholder')" />
			<div>
				<i18n-t keypath="uploadDBDialog.commentTip" />
			</div>
			<NAlert v-if="issues.length > 0" type="error">
				<i18n-t keypath="uploadDBDialog.issuesWarning" />
				<ul>
					<li v-for="issue in issues">
						{{ issue }}
					</li>
				</ul>
			</NAlert>
		</NSpace>
		<template #footer>
			<NButton :disabled="submitData.processing || !submitData.name || issues.length > 0" type="primary"
				@click="uploadAndSubmit">
				<i18n-t keypath="uploadDBDialog.uploadBtn" />
			</NButton>
		</template>
	</NModal>
</template>

<script lang="ts" setup>
import {
	NAlert,
	NButton,
	NCheckbox,
	NInput,
	NModal,
	NRadio,
	NSpace,
	useNotification
} from "naive-ui";
import { computed, reactive, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useDialogs, useEditingLyric, useSettings } from "../../store";
import { checkLyric } from "../../utils/lyric-checker.js";
import type { TTMLMetadata } from "../../utils/ttml-types";

const settings = useSettings();
const lyric = useEditingLyric();
const notify = useNotification();
const dialogs = useDialogs();
const { t } = useI18n({ useScope: "global" });

const submitData = reactive({
	name: "",
	submitReason: "新歌词提交",
	comment: "",
	processing: false,
	generateMusicNameFromMetadata: true,
});

function getMetadata(metadata: TTMLMetadata[], key: string) {
	const result: string[] = [];
	metadata
		.filter((v) => v.key === key)
		.map((v) => v.value)
		.forEach((meta) => {
			result.push(...meta);
		});
	return result;
}

const hasMusicId = computed(() => {
	const platforms = ["ncmMusicId", "qqMusicId", "spotifyId", "appleMusicId"];
	for (const platform of platforms) {
		if (
			getMetadata(lyric.metadata, platform).filter((v) => v.trim().length > 0)
				.length > 0
		) {
			return true;
		}
	}
	return false;
});
const hasMusicName = computed(() => {
	return (
		getMetadata(lyric.metadata, "musicName").filter((v) => v.trim().length > 0)
			.length > 0
	);
});
const hasArtists = computed(() => {
	return (
		getMetadata(lyric.metadata, "artists").filter((v) => v.trim().length > 0)
			.length > 0
	);
});
const hasAlbum = computed(() => {
	return (
		getMetadata(lyric.metadata, "album").filter((v) => v.trim().length > 0)
			.length > 0
	);
});

const issues = computed(() => {
	const result: string[] = [];
	if (!hasMusicId.value)
		result.push(t("uploadDBDialog.noMusicIdWarning"));
	if (!hasMusicName.value)
		result.push(t("uploadDBDialog.noMusicNameWarning"));
	if (!hasArtists.value)
		result.push(t("uploadDBDialog.noArtistWarning"));
	if (!hasAlbum.value)
		result.push(t("uploadDBDialog.noAlbumWarning"));
	result.push(...checkLyric(lyric.lyrics));
	return result;
});

watchEffect(() => {
	if (submitData.generateMusicNameFromMetadata) {
		const artists = getMetadata(lyric.metadata, "artists");
		if (artists.length > 0) {
			submitData.name = artists.join(", ");
			if (submitData.name.trim().length === 0) {
				submitData.name = t("uploadDBDialog.unknownArtists");
			}
		} else {
			submitData.name = t("uploadDBDialog.unknownArtists");
		}
		submitData.name += " - ";
		const name = getMetadata(lyric.metadata, "musicName");
		if (name[0] && name[0].trim().length > 0) {
			submitData.name += name[0];
		} else {
			submitData.name += t("uploadDBDialog.unknownMusicName");
		}
	}
});

async function uploadAndSubmit() {
	if (submitData.processing) return;
	submitData.processing = true;
	try {
		const lyricData = encodeURIComponent(lyric.toTTML());
		const lyricUrl = await fetch(settings.dbUploadApiBaseUrl || "https://dpaste.org/api/", {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body:
				`format=url&lexer=xml&expires=3600&filename=lyric.ttml&content=${lyricData}`,
		})
			.then((v) => {
				console.log(v);
				return v.text();
			})
			.then((v) => `${v.trim()}/raw`);
		const issueUrl = new URL(
			"https://github.com/Steve-xmh/amll-ttml-db/issues/new",
		);
		issueUrl.searchParams.append("labels", "歌词提交/补正");
		issueUrl.searchParams.append("template", "submit-lyric.yml");
		issueUrl.searchParams.append("title", `[歌词提交/修正] ${submitData.name}`);
		issueUrl.searchParams.append("song-name", submitData.name);
		issueUrl.searchParams.append("ttml-download-url", lyricUrl);
		issueUrl.searchParams.append("upload-reason", submitData.submitReason);
		issueUrl.searchParams.append("comment", submitData.comment);
		open(issueUrl.toString());
	} catch (err) {
		console.warn("Submit failed", err);
		notify.error({
			title: t("uploadDBDialog.errorNotification.title"),
			content: t("uploadDBDialog.errorNotification.content", [err]),
		});
	}
	submitData.processing = false;
}
</script>
