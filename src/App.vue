<template>
    <NConfigProvider useOsTheme>
        <NGlobalStyle />
        <NLayout position="absolute" :style="{
            '--att-theme-color': themeVars.primaryColorSuppl,
            '--att-theme-color-hover': themeVars.primaryColorHover,
            '--att-theme-color-pressed': themeVars.primaryColorPressed,
            '--att-border-color': themeVars.borderColor,
            '--att-height-medium': themeVars.heightMedium,
        }" content-style="display: flex; flex-direction: column;">
            <NLayoutHeader bordered style="padding: 16px; display: flex; align-items: center">
                <div class="menu-full">
                    <NDropdown trigger="click" @select="onSelectMenu" :options="MENU.file">
                        <NButton quaternary>文件</NButton>
                    </NDropdown>
                    <NDropdown trigger="click" @select="onSelectMenu" :options="MENU.edit">
                        <NButton quaternary>编辑</NButton>
                    </NDropdown>
                    <NDropdown trigger="click" @select="onSelectMenu" :options="MENU.view">
                        <NButton quaternary>查看</NButton>
                    </NDropdown>
                    <NDropdown trigger="click" @select="onSelectMenu" :options="MENU.tool">
                        <NButton quaternary>工具</NButton>
                    </NDropdown>
                    <NDivider vertical />
                </div>
                <div class="menu-slim">
                    <NDropdown trigger="click" @select="onSelectMenu" :options="[{
                        label: '文件',
                        key: 'sub-file',
                        children: MENU.file,
                    }, {
                        label: '编辑',
                        key: 'sub-edit',
                        children: MENU.edit,
                    }, {
                        label: '查看',
                        key: 'sub-view',
                        children: MENU.view,
                    }, {
                        label: '工具',
                        key: 'sub-tool',
                        children: MENU.tool,
                    }]">
                        <NButton secondary circle>
                            <NIcon size="24">
                                <Home24Regular />
                            </NIcon>
                        </NButton>
                    </NDropdown>
                </div>
                <div style="display: flex; justify-content: center; gap: 8px">
                    <NButton :quaternary="edit.editMode !== 'edit'" :type="edit.editMode === 'edit' ? 'primary' : 'default'"
                        @click="edit.editMode = 'edit'">编辑模式</NButton>
                    <NButton :quaternary="edit.editMode !== 'sync'" :type="edit.editMode === 'sync' ? 'primary' : 'default'"
                        @click="edit.editMode = 'sync'">打轴模式</NButton>
                </div>
                <div style="flex: 1; text-align: right" class="app-name">
                    Apple Music-like Lyrics TTML Tool
                </div>
            </NLayoutHeader>
            <NLayoutContent style="flex: 1">
                <LyricEditor v-if="edit.editMode === 'edit'" />
                <LyricSyncEditor v-else-if="edit.editMode === 'sync'" />
            </NLayoutContent>
            <AudioPlayerBar />
        </NLayout>
        <NDropdown trigger="manual" :show="lyricLineMenu.show" @select="onSelectMenu" :x="lyricLineMenu.x" :y="lyricLineMenu.y"
            placement="bottom-start" :options="[
                { label: '删除选定歌词行', key: 'delete-line' },
                { label: '删除选定单词', key: 'delete-word' },
                { type: 'divider' },
                { label: '编辑翻译歌词', key: 'edit-tran' },
                { label: '编辑音译歌词', key: 'edit-roman' },
                { type: 'divider' },
                {
                    label: '对选定行生成音译歌词',
                    key: 'gen-roman',
                    children: [
                        { label: '生成日语音译歌词', key: 'gen-jpn' },
                        { label: '生成粤语注音音译歌词', key: 'gen-cat' },
                    ],
                },
            ]" @clickoutside="lyricLineMenu.show = false" />
        <NModal v-model:show="aboutModalOpened" preset="card" style="max-width: 600px;"
            title="Apple Music-like Lyrics TTML Tool">
            <div>一个用于 Apple Music 的逐词歌词 TTML 编辑和时间轴工具</div>
            <div>
                <NButton @click="goToRepo">Github</NButton>
            </div>
        </NModal>
    </NConfigProvider>
</template>

<script setup lang="ts">
import {
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NDropdown,
    NConfigProvider,
    NButton,
    NDivider,
    NModal,
    NGlobalStyle,
    NIcon,
    useThemeVars,
} from "naive-ui";
import { ref, reactive, onMounted } from "vue";
import saveFile from 'save-file';
import { useEditingLyric, useRightClickLyricLine, useSettings } from "./store";
import LyricEditor from "./components/LyricEditor.vue";
import { parseLyric } from "./utils/ttml-lyric-parser";
import LyricSyncEditor from "./components/LyricSyncEditor.vue";
import AudioPlayerBar from "./components/AudioPlayerBar.vue";
import type { DropdownMixedOption } from "naive-ui/es/dropdown/src/interface";
import { Home24Regular } from "@vicons/fluent";

const themeVars = useThemeVars();
const MENU = ref({
    file: [
        { label: '新建歌词', key: 'new' },
        { label: '打开歌词', key: 'open' },
        { type: 'divider' },
        { label: '保存歌词', key: 'save' },
        // { label: '另存为歌词', key: 'save-as' },
        // { type: 'divider' },
        // { label: '导入歌词', key: 'import' },
        // { label: '导出歌词', key: 'export' },
        { type: 'divider' },
        // { label: '设置', key: 'setting' },
        { label: '关于', key: 'about' },
    ] as DropdownMixedOption[],
    edit: [
        { label: '撤销', key: 'undo' },
        { label: '重做', key: 'redo' },
        { label: '选中所有歌词行', key: 'select-all' },
        { label: '取消选中所有歌词行', key: 'unselect-all' },
        { label: '反选所有歌词行', key: 'invert-select-all' },
        { type: 'divider' },
        { label: '切换所选歌词行为背景人声', key: 'toggle-bg' },
        { label: '切换所选歌词行为对唱人声', key: 'toggle-duet' },
    ] as DropdownMixedOption[],
    view: [
        { label: '显示翻译歌词', key: 'show-tran' },
        { label: '显示音译歌词', key: 'show-roman' },
    ],
    tool: [
        { label: '使用 JieBa 对歌词行分词', key: 'split-words-jieba' },
        // { label: '简繁转换', key: 'trad-to-simp' },
        // { label: '生成日语音译歌词', key: 'gen-jpn' },
        // { label: '生成粤语音译歌词', key: 'gen-cat' },
    ] as DropdownMixedOption[],
});

const aboutModalOpened = ref(false);
const edit = reactive({
    editMode: "edit"
});
const lyric = useEditingLyric();
const lyricLineMenu = useRightClickLyricLine();
const settings = useSettings();
let curAudioURL = "";

function goToRepo() {
    open("https://github.com/Steve-xmh/amll-ttml-tool");
}

function toDuration(duration: number) {
    const isRemainTime = duration < 0;

    const d = Math.abs(duration | 0);
    const sec = d % 60;
    const min = Math.floor((d - sec) / 60);
    const secText = "0".repeat(2 - sec.toString().length) + sec;

    return `${isRemainTime ? "-" : ""}${min}:${secText}`;
}

function onSelectMenu(key: string) {
    lyricLineMenu.show = false;
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
            fileDialog.remove();
            break;
        }
        case "save": {
            const output = lyric.toTTML();
            saveFile(new TextEncoder().encode(output), "lyric.ttml");
            break;
        }
        case "about": {
            aboutModalOpened.value = true;
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
        case "show-tran": {
            settings.showTranslateLine = !settings.showTranslateLine;
            break;
        }
        case "show-roman": {
            settings.showRomanLine = !settings.showRomanLine;
            break;
        }
        case "select-all": {
            lyric.selectAllLine();
            break;
        }
        case "unselect-all": {
            lyric.unselectAllLine();
            break;
        }
        case "invert-select-all": {
            lyric.invertSelectAllLine();
            break;
        }
        case "split-words-jieba": {
            lyric.splitLineByJieba();
            break;
        }
        case "toggle-bg": {
            lyric.toggleSelectedLineBackground();
            break;
        }
        case "toggle-duet": {
            lyric.toggleSelectedLineDuet();
            break;
        }
    }
}
onMounted(() => {
    // ask before page close
    window.addEventListener("beforeunload", evt => {
        evt.preventDefault();
        return evt.returnValue = "";
    })
});
</script>

<style lang="sass">
.menu-full
    flex: 1
.menu-slim
    flex: 1
    display: none
@media screen and (max-width: 768px)
    .app-name
        display: none
    .menu-full
        display: none
    .menu-slim
        display: unset
</style>
