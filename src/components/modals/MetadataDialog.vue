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
	<NModal :show="dialogs.metadata" :title="t('metadataDialog.title')" preset="card" style="max-width: 600px;"
			transform-origin="center" @close="dialogs.metadata = false">
		<NTable>
			<thead>
			<tr>
				<th style="text-align: right;">
					<i18n-t keypath="metadataDialog.tableHead.key"/>
				</th>
				<th>
					<i18n-t keypath="metadataDialog.tableHead.values"/>
				</th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="(metadata, metadataIndex) in lyrics.metadata">
				<td class="key">{{ getKeyName(metadata.key) }}</td>
				<td>
					<div v-for="(value, valueIndex) in metadata.value" class="entry">
						<NInput :placeholder="t('metadataDialog.valuePlaceholder')" :value="value"
								@input="event => metadata.value[valueIndex] = event"/>
						<!--						<NButton>Delete</NButton>-->
						<NButton circle quaternary @click="deleteValueOrMetadata(metadataIndex, valueIndex)">
							<template #icon>
								<NIcon>
									<Delete16Filled/>
								</NIcon>
							</template>
						</NButton>
					</div>
				</td>
			</tr>
			<tr>
				<td>
					<NSelect v-model:value="selectedNewKey" :options="builtinOptions"
							 :placeholder="t('metadataDialog.selectNew')"
							 filterable
							 tag/>
				</td>
				<td>
					<NButton :disabled="!selectedNewKey" block @click="onAddNewMetadata">
						<i18n-t keypath="metadataDialog.addNew"/>
					</NButton>
				</td>
			</tr>
			</tbody>
		</NTable>
	</NModal>
</template>

<script lang="ts" setup>
import {NButton, NIcon, NInput, NModal, NSelect, NTable, type SelectOption} from "naive-ui";
import {Delete16Filled} from "@vicons/fluent";
import {useDialogs, useEditingLyric} from "../../store";
import {useI18n} from "vue-i18n";
import {ref} from "vue";

const dialogs = useDialogs();
const lyrics = useEditingLyric();
const {t} = useI18n({useScope: "global"});

function deleteValueOrMetadata(metadataIndex: number, valueIndex: number) {
	const metadata = lyrics.metadata[metadataIndex];
	if (metadata.value.length > 1) {
		metadata.value.splice(valueIndex, 1);
	} else {
		lyrics.metadata.splice(metadataIndex, 1);
	}
}

function onAddNewMetadata() {
	if (selectedNewKey.value) {
		const existed = lyrics.metadata.find(metadata => metadata.key === selectedNewKey.value);
		if (existed) {
			existed.value.push("");
		} else {
			lyrics.metadata.push({
				key: selectedNewKey.value,
				value: [""]
			});
		}
	}
}

function getKeyName(key: string): string {
	return `${builtinOptions.find(option => option.value === key)?.label || key}`;
}

const selectedNewKey = ref<string | null>(null);
const builtinOptions: SelectOption[] = [{
	// 歌词所匹配的网易云音乐 ID
	label: t("metadataDialog.builtinOptions.ncmMusicId"),
	value: "ncmMusicId"
}, {
	// 歌词所匹配的 QQ 音乐 ID
	label: t("metadataDialog.builtinOptions.qqMusicId"),
	value: "qqMusicId"
}, {
	// 歌词所匹配的 Spotify 音乐 ID
	label: t("metadataDialog.builtinOptions.spotifyId"),
	value: "spotifyId"
}, {
	// 歌词所匹配的 Apple Music 音乐 ID
	label: t("metadataDialog.builtinOptions.appleMusicId"),
	value: "appleMusicId"
}, {
	// 歌词所匹配的 ISRC 编码
	label: t("metadataDialog.builtinOptions.isrc"),
	value: "isrc"
}, {
	// 歌词所匹配的歌曲名
	label: t("metadataDialog.builtinOptions.musicName"),
	value: "musicName"
}, {
	// 歌词所匹配的歌手名
	label: t("metadataDialog.builtinOptions.artists"),
	value: "artists"
}, {
	// 歌词所匹配的专辑名
	label: t("metadataDialog.builtinOptions.album"),
	value: "album"
}, {
	// 逐词歌词作者 Github ID，例如 Steve-xmh
	label: t("metadataDialog.builtinOptions.ttmlAuthorGithub"),
	value: "ttmlAuthorGithub"
}];

</script>

<style lang="sass" scoped>
.key
	vertical-align: text-top
	text-align: right

.entry
	display: flex
	align-items: center
	gap: 8px
	margin-top: 8px

	&:first-child
		margin-top: 0

</style>
