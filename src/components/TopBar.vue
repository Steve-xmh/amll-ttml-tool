<template>
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
    <NModal v-model:show="aboutModalOpened" preset="card" transform-origin="center" style="max-width: 600px;"
        title="Apple Music-like Lyrics TTML Tool">
        <NSpace vertical>
            <div>一个用于 Apple Music 的逐词歌词 TTML 编辑和时间轴工具</div>
            <NSpace>
                <NButton @click="goToRepo">Github</NButton>
                <NButton @click="settings.showingTutorial = true; aboutModalOpened = false;">简短教程</NButton>
            </NSpace>
        </NSpace>
    </NModal>
</template>

<script setup lang="ts">
import {
    NLayoutHeader,
    NDropdown,
    NButton,
    NDivider,
    NIcon,
    NModal,
    NSpace,
    useNotification,
} from "naive-ui";
import { ref, reactive } from "vue";
import saveFile from 'save-file';
import { parseLyric } from "../utils/ttml-lyric-parser";
import type { DropdownMixedOption } from "naive-ui/es/dropdown/src/interface";
import { Home24Regular } from "@vicons/fluent";
import { useEditMode, useRightClickLyricLine, useEditingLyric, useSettings } from "../store";
import { parseLrc } from "../../src-wasm/pkg";
import type { LyricLine } from "../store/lyric";

const edit = useEditMode();
const lyric = useEditingLyric();
const lyricLineMenu = useRightClickLyricLine();
const settings = useSettings();
const aboutModalOpened = ref(false);
const notify = useNotification();

const MENU = ref({
    file: [
        { label: '新建歌词', key: 'new' },
        { label: '打开歌词', key: 'open' },
        { type: 'divider' },
        { label: '保存歌词', key: 'save' },
        // { label: '另存为歌词', key: 'save-as' },
        // { type: 'divider' },
        {
            label: '导入歌词...', key: 'import-from', children: [{
                label: '从 LRC 歌词导入', key: 'import-from-lrc',
            }, {
                label: '从 YRC 歌词导入', key: 'import-from-yrc',
            }, {
                label: '从 QRC 歌词导入', key: 'import-from-qrc',
            }, {
                label: '从 Lyricify Syllable 歌词导入', key: 'import-from-lys',
            }]
        },
        {
            label: '导出歌词...', key: 'export-to', children: [{
                label: '导出 LRC 歌词', key: 'export-to-lrc',
            }, {
                label: '导出 YRC 歌词', key: 'export-to-yrc',
            }, {
                label: '导出 QRC 歌词', key: 'export-to-qrc',
            }, {
                label: '导出 Lyricify Syllable 歌词', key: 'export-to-lys',
            }]
        },
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
        // { label: '生成日语罗马字音译歌词', key: 'gen-jpn-romaji' },
        // { label: '生成粤语音译歌词', key: 'gen-cat' },
    ] as DropdownMixedOption[],
});

function goToRepo() {
    open("https://github.com/Steve-xmh/amll-ttml-tool");
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
        case "import-from-lrc": {
            const fileDialog = document.createElement("input");
            fileDialog.type = "file";
            fileDialog.accept = ".lrc, */*";
            fileDialog.click();
            fileDialog.addEventListener("input", async () => {
                const text = await fileDialog.files?.[0].text();
                if (text) lyric.loadLRC(text);
            });
            fileDialog.remove();
            break;
        }
        case "import-from-yrc": {
            const fileDialog = document.createElement("input");
            fileDialog.type = "file";
            fileDialog.accept = ".yrc, */*";
            fileDialog.click();
            fileDialog.addEventListener("input", async () => {
                const text = await fileDialog.files?.[0].text();
                if (text) lyric.loadYRC(text);
            });
            fileDialog.remove();
            break;
        }
        case "import-from-qrc": {
            const fileDialog = document.createElement("input");
            fileDialog.type = "file";
            fileDialog.accept = ".qrc, */*";
            fileDialog.click();
            fileDialog.addEventListener("input", async () => {
                const text = await fileDialog.files?.[0].text();
                if (text) lyric.loadQRC(text);
            });
            fileDialog.remove();
            break;
        }
        case "import-from-lys": {
            const fileDialog = document.createElement("input");
            fileDialog.type = "file";
            fileDialog.accept = ".lys, */*";
            fileDialog.click();
            fileDialog.addEventListener("input", async () => {
                const text = await fileDialog.files?.[0].text();
                if (text) lyric.loadLYS(text);
            });
            fileDialog.remove();
            break;
        }
        case "save": {
            const output = lyric.toTTML();
            saveFile(new TextEncoder().encode(output), "lyric.ttml");
            break;
        }
        case "export-to-lrc": {
            const output = lyric.toLRC();
            saveFile(new TextEncoder().encode(output), "lyric.lrc");
            break;
        }
        case "export-to-yrc": {
            const output = lyric.toYRC();
            saveFile(new TextEncoder().encode(output), "lyric.yrc");
            break;
        }
        case "export-to-qrc": {
            const output = lyric.toQRC();
            saveFile(new TextEncoder().encode(output), "lyric.qrc");
            break;
        }
        case "export-to-lys": {
            const output = lyric.toLYS();
            saveFile(new TextEncoder().encode(output), "lyric.lys");
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
        default: {
            notify.error({
                title: "功能暂未实现",
                content: "请静候作者爆肝实现吧~",
                duration: 4000,
            });
        }
    }
}

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
