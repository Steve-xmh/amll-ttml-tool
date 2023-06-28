<template>
    <NLayoutFooter bordered style="padding: 16px; gap: 16px; display: flex; align-items: center">
        <NUpload :default-upload="false" :multiple="false" :show-file-list="false" style="width: unset"
            @change="onUploadMusic">
            <NButton :quaternary="!!curFile">{{
                curFile?.name ?? "加载音乐"
            }}</NButton>
        </NUpload>
        <NButton text :disabled="!audio.canPlay"
            @click="audio.playing ? audioPlayer.pause() : audioPlayer.play()">
            <NIcon>
                <Pause48Filled v-if="audio.playing" />
                <Play48Filled v-else />
            </NIcon>
        </NButton>
        <div>{{ toDuration(audio.currentTime / 1000) }}</div>
        <NSlider :disabled="!audio.canPlay" :max="audioPlayer.duration" :value="Math.floor(audio.currentTime / 1000)"
            @update:value="audioPlayer.currentTime = $event; audio.currentTime = $event" />
        <div>{{ toDuration((audio.currentTime - audio.duration) / 1000) }}</div>
        <NIcon>
            <Speaker248Filled />
        </NIcon>
        <NSlider :max="1" :step="0.01" :value="settings.volume"
            @update:value="settings.volume = $event; audioPlayer.volume = $event" :min="0" style="max-width: 100px" />
    </NLayoutFooter>
</template>

<script setup lang="ts">
import {
    NLayoutFooter,
    NSlider,
    NIcon,
    NButton,
    NUpload,
    type UploadFileInfo,
} from "naive-ui";
import { Play48Filled, Pause48Filled, Speaker248Filled } from "@vicons/fluent";
import { ref, reactive, onUnmounted } from "vue";
import { useAudio, useSettings } from "../store";

const curFile = ref<UploadFileInfo>();
const audioPlayer = ref(new Audio());
const edit = reactive({
    editMode: "edit"
});
const settings = useSettings();
const audio = useAudio();

audioPlayer.value.addEventListener("canplay", () => {
    audio.playing = false;
    audio.canPlay = true;
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
    }
    frameCb.value = requestAnimationFrame(onFrame)
});

audioPlayer.value.addEventListener("play", () => {
    audio.playing = true;
});

audioPlayer.value.addEventListener("pause", () => {
    audio.playing = false;
});

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
        console.log("音乐上传", options);
        audio.audioURL = URL.createObjectURL(options.file.file);
        audioPlayer.value.src = audio.audioURL;
    }
}

onUnmounted(() => {
    if (audio.audioURL.length > 0) {
        URL.revokeObjectURL(audio.audioURL);
    }
})

</script>
