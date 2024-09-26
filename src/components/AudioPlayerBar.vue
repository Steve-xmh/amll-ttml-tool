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
	<NLayoutFooter bordered class="audio-player-bar">
		<NUpload ref="uploadRef" :default-upload="false" :multiple="false" :show-file-list="false" style="width: unset"
			@change="onUploadMusic">
			<NButton v-if="!curFile">
				<i18n-t keypath="audioPlayerBar.loadMusicBtn" />
			</NButton>
			<NButton v-else circle quaternary>
				<NIcon size="18">
					<MusicNote224Filled />
				</NIcon>
			</NButton>
		</NUpload>
		<NButton :disabled="!audio.canPlay" circle quaternary
			@click="audio.playing ? audioPlayer.pause() : audioPlayer.play()">
			<NIcon size="18">
				<Pause48Filled v-if="audio.playing" />
				<Play48Filled v-else />
			</NIcon>
		</NButton>
		<div>{{ toDuration(audio.currentTime / 1000) }}</div>
		<NSlider :disabled="!audio.canPlay" :format-tooltip="(v) => toDuration(v)" :max="audioPlayer.duration"
			:value="Math.floor(audio.currentTime / 1000)" @update:value="
				audio.setCurrentTime($event * 1000);
			" />
		<div class="hide-if-small">{{ toDuration((audio.currentTime - audio.duration) / 1000) }}</div>
		<NIcon class="hide-if-small" size="18">
			<TopSpeed24Regular />
		</NIcon>
		<NSlider :format-tooltip="(v) => `${v.toFixed(2)}x`" :max="4" :min="0.25" :step="0.25" :value="settings.speed"
			class="hide-if-small" style="max-width: 100px" @update:value="
				settings.speed = $event;
			audioPlayer.playbackRate = $event;
			" />
		<NIcon class="hide-if-small" size="18">
			<Speaker248Filled />
		</NIcon>
		<NSlider :format-tooltip="(v) => `${(v * 100) | 0}%`" :max="1" :min="0" :step="0.01" :value="settings.volume"
			class="hide-if-small" style="max-width: 100px" @update:value="
				settings.volume = $event;
			audioPlayer.volume = $event;
			" />
	</NLayoutFooter>
</template>

<script setup lang="ts">
import {
	MusicNote224Filled,
	Pause48Filled,
	Play48Filled,
	Speaker248Filled,
	TopSpeed24Regular,
} from "@vicons/fluent";
import {
	NButton,
	NIcon,
	NLayoutFooter,
	NSlider,
	NUpload,
	type UploadFileInfo,
	type UploadInst,
} from "naive-ui";
import { onMounted, onUnmounted, ref } from "vue";
import { useAudio, useSettings } from "../store";
import { useKeyBinding } from "../utils/keybindings";

const curFile = ref<UploadFileInfo>();
const audioPlayer = ref(new Audio());
const settings = useSettings();
const audio = useAudio();
const uploadRef = ref<UploadInst | null>(null);

audio.$onAction((e) => {
	if (e.name === "setCurrentTime") {
		audioPlayer.value.currentTime = e.args[0] / 1000;
	}
});

settings.$subscribe(
	() => {
		audioPlayer.value.playbackRate = Math.max(
			0.25,
			Math.min(4, settings.speed),
		);
		audioPlayer.value.volume = Math.max(0, Math.min(1, settings.volume));
	},
	{
		flush: "post",
	},
);

function toDuration(duration: number) {
	const isRemainTime = duration < 0;

	const d = Math.abs(duration | 0);
	const sec = d % 60;
	const min = Math.floor((d - sec) / 60);
	const secText = "0".repeat(2 - sec.toString().length) + sec;

	return `${isRemainTime ? "-" : ""}${min}:${secText}`;
}

function onUploadMusic(options: {
	file: UploadFileInfo;
	fileList: Array<UploadFileInfo>;
	event?: Event;
}) {
	if (audio.audioURL.length > 0) {
		URL.revokeObjectURL(audio.audioURL);
	}
	audio.canPlay = false;
	audioPlayer.value.pause();
	if (options.file.file) {
		curFile.value = options.file;
		audio.audioURL = URL.createObjectURL(options.file.file);
		audioPlayer.value.src = audio.audioURL;
	}
}

onMounted(() => {
	audioPlayer.value.addEventListener("canplay", () => {
		audio.canPlay = true;
		audio.duration = audioPlayer.value.duration * 1000;
		audioPlayer.value.playbackRate = Math.max(
			0.25,
			Math.min(4, settings.speed),
		);
		audioPlayer.value.volume = Math.max(0, Math.min(1, settings.volume));
	});

	audioPlayer.value.addEventListener("play", () => {
		audio.playing = true;
	});

	audioPlayer.value.addEventListener("pause", () => {
		audio.playing = false;
	});

	let frameCb = ref(0);
	audioPlayer.value.addEventListener("timeupdate", () => {
		audio.currentTime = audioPlayer.value.currentTime * 1000;
		if (frameCb.value) {
			cancelAnimationFrame(frameCb.value);
		}
		const onFrame = () => {
			if (audio.playing) {
				audio.currentTime = audioPlayer.value.currentTime * 1000;
				frameCb.value = requestAnimationFrame(onFrame);
			}
		};
		frameCb.value = requestAnimationFrame(onFrame);
	});

	audioPlayer.value.playbackRate = Math.max(0.25, Math.min(4, settings.speed));
	audioPlayer.value.volume = Math.max(0, Math.min(1, settings.volume));
});

useKeyBinding(settings.keybindings.resumeOrPause, () => {
	if (audioPlayer.value.paused) {
		audioPlayer.value.play();
	} else {
		audioPlayer.value.pause();
	}
});
useKeyBinding(settings.keybindings.volumeUp, () => {
	settings.volume = Math.min(1, Math.max(0, settings.volume + 0.1));
});
useKeyBinding(settings.keybindings.volumeDown, () => {
	settings.volume = Math.min(1, Math.max(0, settings.volume - 0.1));
});
useKeyBinding(settings.keybindings.seekPlayForward5s, () => {
	if (audioPlayer.value.seekable) {
		audioPlayer.value.currentTime = Math.min(
			audioPlayer.value.duration,
			audioPlayer.value.currentTime + 5,
		);
	}
});
useKeyBinding(settings.keybindings.seekPlayBackward5s, () => {
	if (audioPlayer.value.seekable) {
		audioPlayer.value.currentTime = Math.max(
			0,
			audioPlayer.value.currentTime - 5,
		);
	}
});
useKeyBinding(settings.keybindings.seekPlayForward1s, () => {
	if (audioPlayer.value.seekable) {
		audioPlayer.value.currentTime = Math.min(
			audioPlayer.value.duration,
			audioPlayer.value.currentTime + 1,
		);
	}
});
useKeyBinding(settings.keybindings.seekPlayBackward1s, () => {
	if (audioPlayer.value.seekable) {
		audioPlayer.value.currentTime = Math.max(
			0,
			audioPlayer.value.currentTime - 1,
		);
	}
});
useKeyBinding(settings.keybindings.seekPlayForward100ms, () => {
	if (audioPlayer.value.seekable) {
		audioPlayer.value.currentTime = Math.min(
			audioPlayer.value.duration,
			audioPlayer.value.currentTime + 0.1,
		);
	}
});
useKeyBinding(settings.keybindings.seekPlayBackward100ms, () => {
	if (audioPlayer.value.seekable) {
		audioPlayer.value.currentTime = Math.max(
			0,
			audioPlayer.value.currentTime - 0.1,
		);
	}
});
useKeyBinding(settings.keybindings.speedUp, () => {
	settings.speed = Math.max(0.25, Math.min(4, settings.speed + 0.25));
});
useKeyBinding(settings.keybindings.speedDown, () => {
	settings.speed = Math.max(0.25, Math.min(4, settings.speed - 0.25));
});
useKeyBinding(settings.keybindings.openMusicFile, () => {
	uploadRef.value?.openOpenFileDialog();
});

onUnmounted(() => {
	if (audio.audioURL.length > 0) {
		URL.revokeObjectURL(audio.audioURL);
	}
	audioPlayer.value.pause();
	audioPlayer.value.remove();
});
</script>

<style lang="css" scoped>
.audio-player-bar {
	padding: 16px;
	gap: 16px;
	display: flex;
	align-items: center;

	@media screen and (max-width: 768px) {
		gap: 4px;
	}
}

.hide-if-small {
	@media screen and (max-width: 768px) {
		display: none;
	}
}
</style>
