<template>
    <NLayoutFooter bordered style="padding: 16px; gap: 16px; display: flex; align-items: center">
        <NUpload :default-upload="false" :multiple="false" :show-file-list="false" style="width: unset"
            @change="onUploadMusic">
            <NButton v-if="!curFile">{{ "加载音乐" }}</NButton>
            <NButton v-else quaternary circle>
                <NIcon size="18">
                    <MusicNote224Filled />
                </NIcon>
            </NButton>
        </NUpload>
        <NButton quaternary circle :disabled="!audio.canPlay"
            @click="audio.playing ? audioPlayer.pause() : audioPlayer.play()">
            <NIcon size="18">
                <Pause48Filled v-if="audio.playing" />
                <Play48Filled v-else />
            </NIcon>
        </NButton>
        <div>{{ toDuration(audio.currentTime / 1000) }}</div>
        <NSlider :disabled="!audio.canPlay" :max="audioPlayer.duration" :value="Math.floor(audio.currentTime / 1000)"
            :format-tooltip="(v) => toDuration(v)" @update:value="
                audioPlayer.currentTime = $event;
            audio.currentTime = $event;
            " />
        <div>{{ toDuration((audio.currentTime - audio.duration) / 1000) }}</div>
        <NIcon size="18">
            <TopSpeed24Regular />
        </NIcon>
        <NSlider :min="0.25" :max="4" :step="0.25" :value="settings.speed" :format-tooltip="(v) => `${v.toFixed(2)}x`"
            @update:value="
                settings.speed = $event;
            audioPlayer.playbackRate = $event;
            " style="max-width: 100px" />
        <NIcon size="18">
            <Speaker248Filled />
        </NIcon>
        <NSlider :max="1" :step="0.01" :value="settings.volume" :format-tooltip="(v) => `${(v * 100) | 0}%`" @update:value="
            settings.volume = $event;
        audioPlayer.volume = $event;
        " :min="0" style="max-width: 100px" />
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
import {
    Play48Filled,
    Pause48Filled,
    Speaker248Filled,
    MusicNote224Filled,
    TopSpeed24Regular,
} from "@vicons/fluent";
import { ref, reactive, onUnmounted, onMounted } from "vue";
import { useAudio, useSettings } from "../store";

const curFile = ref<UploadFileInfo>();
const audioPlayer = ref(new Audio());
const settings = useSettings();
const audio = useAudio();

settings.$subscribe(
    () => {
        audioPlayer.value.playbackRate = Math.max(
            0.25,
            Math.min(4, settings.speed)
        );
        audioPlayer.value.volume = Math.max(0, Math.min(1, settings.volume));
    },
    {
        flush: "post",
    }
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
            Math.min(4, settings.speed)
        );
        audioPlayer.value.volume = Math.max(0, Math.min(1, settings.volume));
    });

    audioPlayer.value.addEventListener("seeked", () => {
        audio.playing = true;
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

onUnmounted(() => {
    if (audio.audioURL.length > 0) {
        URL.revokeObjectURL(audio.audioURL);
    }
    audioPlayer.value.pause();
    audioPlayer.value.remove();
});
</script>
