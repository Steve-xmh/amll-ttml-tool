<template>
    <NConfigProvider :theme="darkTheme">
        <NLayout position="absolute" content-style="display: flex; flex-direction: column;">
            <NLayoutHeader bordered style="padding: 16px; display: flex; align-items: center">
                <div style="flex: 1">
                    <NDropdown trigger="click" @select="onSelectMenu" :options="[
                        { label: '新建歌词', key: 'new' },
                        { label: '打开歌词', key: 'open' },
                        { type: 'divider' },
                        { label: '保存歌词', key: 'save' },
                        { label: '另存为歌词', key: 'save-as' },
                        { type: 'divider' },
                        { label: '导入歌词', key: 'import' },
                        { label: '导出歌词', key: 'export' },
                        { type: 'divider' },
                        { label: '设置', key: 'setting' },
                        { label: '关于', key: 'about' },
                    ]">
                        <NButton quaternary>文件</NButton>
                    </NDropdown>
                    <NDropdown trigger="click" @select="onSelectMenu" :options="[
                        { label: '撤销', key: 'undo' },
                        { label: '重做', key: 'redo' },
                    ]">
                        <NButton quaternary>编辑</NButton>
                    </NDropdown>
                    <NDropdown trigger="click" @select="onSelectMenu" :options="[
                        { label: '生成日语音译歌词', key: 'undo' },
                        { label: '生成粤语音译歌词', key: 'redo' },
                    ]">
                        <NButton quaternary>工具</NButton>
                    </NDropdown>
                    <NDivider vertical />
                </div>
                <div style="display: flex; justify-content: center">
                    <NButton quaternary type="primary">编辑模式</NButton>
                    <NButton quaternary>打轴模式</NButton>
                </div>
                <div style="flex: 1; text-align: right">
                    Apple Music-like Lyrics TTML Tool
                </div>
            </NLayoutHeader>
            <NLayoutContent style="flex: 1">
                <LyricEditor />
            </NLayoutContent>
            <audio :src="curFile?.url ?? ''" ref="globalAudio"></audio>
            <NLayoutFooter bordered style="padding: 16px; gap: 16px; display: flex; align-items: center">
                <NUpload :default-upload="false" :multiple="false" :show-file-list="false" style="width: unset"
                    @change="onUploadMusic">
                    <NButton :quaternary="!!curFile">{{
                        curFile?.name ?? "加载音乐"
                    }}</NButton>
                </NUpload>
                <NButton text :disabled="!playState.canPlay" @click="playState.isPlaying ? audio.pause() : audio.play()">
                    <NIcon>
                        <Pause48Filled v-if="playState.isPlaying" />
                        <Play48Filled v-else />
                    </NIcon>
                </NButton>
                <div>{{ toDuration(playState.curPos) }}</div>
                <NSlider :max="playState.totalTime" :value="playState.curPos" />
                <div>{{ toDuration(playState.curPos - playState.totalTime) }}</div>
                <NIcon>
                    <Speaker248Filled />
                </NIcon>
                <NSlider :max="1" :step="0.01" :value="playState.volume" :min="0" style="max-width: 100px" />
            </NLayoutFooter>
        </NLayout>
        <NDropdown trigger="manual" :show="lyricLineMenu.show" :x="lyricLineMenu.x" :y="lyricLineMenu.y"
            placement="bottom-start" :options="[
                { label: '删除选定歌词行', key: 'new' },
                { label: '复制选定歌词行', key: 'open' },
                {
                    label: '对选定行生成音译歌词',
                    key: 'gen-roman',
                    children: [
                        { label: '生成日语音译歌词', key: 'gen-jpn' },
                        { label: '生成粤语注音音译歌词', key: 'gen-cat' },
                    ],
                },
            ]" @clickoutside="lyricLineMenu.show = false" />
    </NConfigProvider>
</template>

<script setup lang="ts">
import {
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NDropdown,
    NSlider,
    NIcon,
    NConfigProvider,
    NButton,
    NDivider,
    NUpload,
    darkTheme,
    type UploadFileInfo,
} from "naive-ui";
import { Play48Filled, Pause48Filled, Speaker248Filled } from "@vicons/fluent";
import { ref, reactive, onUnmounted } from "vue";
import { useEditingLyric, useRightClickLyricLine } from "./store";
import LyricEditor from "./components/LyricEditor.vue";
import { parseLyric } from "./utils/ttml-lyric-parser";

const curFile = ref<UploadFileInfo>();
const audio = ref(new Audio());
const playState = reactive({
    curPos: 0,
    totalTime: 0,
    isPlaying: false,
    canPlay: false,
    volume: 0.5,
});
const lyric = useEditingLyric();
const lyricLineMenu = useRightClickLyricLine();
let curAudioURL = "";

function toDuration(duration: number) {
    const isRemainTime = duration < 0;

    const d = Math.abs(duration | 0);
    const sec = d % 60;
    const min = Math.floor((d - sec) / 60);
    const secText = "0".repeat(2 - sec.toString().length) + sec;

    return `${isRemainTime ? "-" : ""}${min}:${secText}`;
}

function onSelectMenu(key: string) {
    switch (key) {
        case "new": {
            lyric.reset();
            break;
        }
        case "open": {
            const fileDialog = document.createElement("input");
            fileDialog.type = "file";
            fileDialog.accept = ".ttml, application/ttml+xml, application/xml, */*";
            fileDialog.click();
            fileDialog.addEventListener("input", async () => {
                const text = await fileDialog.files?.[0].text();
                if (text) {
                    const result = parseLyric(text);
                    lyric.loadLyric(result);
                }
            });
            break;
        }
        case "undo": {
            lyric.undo();
            break;
        }
        case "redo": {
            lyric.redo();
            break;
        }
    }
}

audio.value.volume = playState.volume;

audio.value.addEventListener("canplay", () => {
    playState.isPlaying = false;
    playState.canPlay = true;
    playState.curPos = audio.value.currentTime;
    playState.totalTime = audio.value.duration;
});

audio.value.addEventListener("timeupdate", () => {
    playState.curPos = audio.value.currentTime;
});

audio.value.addEventListener("play", () => {
    playState.isPlaying = true;
});

audio.value.addEventListener("pause", () => {
    playState.isPlaying = false;
});

function onUploadMusic(options: {
    file: UploadFileInfo;
    fileList: Array<UploadFileInfo>;
    event?: Event;
}) {
    if (curAudioURL) {
        URL.revokeObjectURL(curAudioURL);
    }
    playState.canPlay = false;
    if (options.file.file) {
        curFile.value = options.file;
        console.log("音乐上传", options);
        curAudioURL = URL.createObjectURL(options.file.file);
        audio.value.src = curAudioURL;
    }
}

onUnmounted(() => {
    if (curAudioURL) {
        URL.revokeObjectURL(curAudioURL);
    }
    audio.value.pause();
    audio.value.remove();
});
</script>

<style lang="sass"></style>
