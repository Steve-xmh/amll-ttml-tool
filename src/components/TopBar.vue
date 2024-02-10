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
  <NLayoutHeader bordered style="padding: 16px; display: flex; align-items: center">
    <div class="menu-full">
      <NDropdown :options="MENU.file" placement="bottom-start" trigger="click" @select="onSelectMenu">
        <NButton quaternary>
          <i18n-t keypath="topBar.menu.file"/>
        </NButton>
      </NDropdown>
      <NDropdown :options="MENU.edit" placement="bottom-start" trigger="click" @select="onSelectMenu">
        <NButton quaternary>
          <i18n-t keypath="topBar.menu.edit"/>
        </NButton>
      </NDropdown>
      <NDropdown :options="MENU.view" placement="bottom-start" trigger="click" @select="onSelectMenu">
        <NButton quaternary>
          <i18n-t keypath="topBar.menu.view"/>
        </NButton>
      </NDropdown>
      <NDropdown :options="MENU.tool" placement="bottom-start" trigger="click" @select="onSelectMenu">
        <NButton quaternary>
          <i18n-t keypath="topBar.menu.tool"/>
        </NButton>
      </NDropdown>
      <NDivider vertical/>
    </div>
    <div class="menu-slim">
      <NDropdown :options="[{
                label: t('topBar.menu.file'),
                key: 'sub-file',
                children: MENU.file,
            }, {
                label: t('topBar.menu.edit'),
                key: 'sub-edit',
                children: MENU.edit,
            }, {
                label: t('topBar.menu.view'),
                key: 'sub-view',
                children: MENU.view,
            }, {
                label: t('topBar.menu.tool'),
                key: 'sub-tool',
                children: MENU.tool,
            }]" trigger="click" @select="onSelectMenu">
        <NButton circle secondary>
          <NIcon size="24">
            <Home24Regular/>
          </NIcon>
        </NButton>
      </NDropdown>
    </div>
    <div style="display: flex; justify-content: center; gap: 8px">
      <NButton :quaternary="edit.editMode !== 'edit'" :type="edit.editMode === 'edit' ? 'primary' : 'default'"
               @click="edit.editMode = 'edit'">
        <i18n-t keypath="topBar.modeBtns.edit"/>
      </NButton>
      <NButton :quaternary="edit.editMode !== 'sync'" :type="edit.editMode === 'sync' ? 'primary' : 'default'"
               @click="edit.editMode = 'sync'">
        <i18n-t keypath="topBar.modeBtns.sync"/>
      </NButton>
      <NButton :quaternary="edit.editMode !== 'amll-preview'"
               :type="edit.editMode === 'amll-preview' ? 'primary' : 'default'" @click="edit.editMode = 'amll-preview'">
        <i18n-t keypath="topBar.modeBtns.preview"/>
      </NButton>
    </div>
    <div class="app-name" style="flex: 1; text-align: right">
      <i18n-t keypath="topBar.appName"/>
    </div>
  </NLayoutHeader>
  <NModal v-model:show="aboutModalOpened" :title="t('aboutModal.appName')" preset="card" style="max-width: 600px;"
          transform-origin="center">
    <NSpace vertical>
      <div>
        <i18n-t keypath="aboutModal.description"/>
      </div>
      <NSpace>
        <NButton @click="goToRepo">
          <i18n-t keypath="aboutModal.githubBtn"/>
        </NButton>
        <NButton @click="settings.showingTutorial = true; aboutModalOpened = false;">
          <i18n-t
              keypath="aboutModal.tutorialBtn"/>
        </NButton>
      </NSpace>
    </NSpace>
  </NModal>
</template>

<script setup lang="ts">
import {NButton, NDivider, NDropdown, NIcon, NLayoutHeader, NModal, NSpace, useNotification,} from "naive-ui";
import {type Component, h, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import saveFile from 'save-file';
import {parseLyric} from "../utils/ttml-parser";
import type {DropdownMixedOption} from "naive-ui/es/dropdown/src/interface";
import {
  ArrowExportRtl24Regular,
  ArrowImport24Regular,
  ArrowRedo24Regular,
  ArrowUndo24Regular,
  Clipboard24Regular,
  ClipboardPaste24Regular,
  CloudArrowDown24Regular,
  CloudArrowUp24Regular,
  Document24Regular,
  FolderOpen24Regular,
  Home24Regular,
  Info24Regular,
  MultiselectLtr24Regular,
  Save24Regular,
  SelectAllOff24Regular,
  SelectAllOn24Regular,
  Settings24Regular,
  TextAlignRight24Filled,
  TextBulletListSquareEdit24Regular,
  VideoBackgroundEffect24Regular,
} from "@vicons/fluent";
import {useDialogs, useEditingLyric, useEditMode, useRightClickLyricLine, useSettings} from "../store";

const edit = useEditMode();
const lyric = useEditingLyric();
const lyricLineMenu = useRightClickLyricLine();
const settings = useSettings();
const aboutModalOpened = ref(false);
const notify = useNotification();
const dialogs = useDialogs();
const {t} = useI18n({useScope: "global"});

const renderIcon = (icon: Component) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}

const MENU = reactive({
  file: [
    {label: t('topBar.menu.newLyric'), key: 'new', icon: renderIcon(Document24Regular)},
    {label: t('topBar.menu.openLyric'), key: 'open', icon: renderIcon(FolderOpen24Regular)},
    {label: t('topBar.menu.openFromClipboard'), key: 'open-from-clipboard', icon: renderIcon(Clipboard24Regular)},
    {type: 'divider'},
    {label: t('topBar.menu.saveLyric'), key: 'save', icon: renderIcon(Save24Regular)},
    {label: t('topBar.menu.saveLyricToClipboard'), key: 'save-to-clipboard', icon: renderIcon(ClipboardPaste24Regular)},
    // { label: '另存为歌词', key: 'save-as' },
    // { type: 'divider' },
    {
      label: t('topBar.menu.importLyric'), key: 'import-from', icon: renderIcon(ArrowImport24Regular), children: [{
        label: t('topBar.menu.importLyricFromText'), key: 'import-from-text',
      }, {
        label: t('topBar.menu.importLyricFromLrc'), key: 'import-from-lrc',
      }, {
        label: t('topBar.menu.importLyricFromEslrc'), key: 'import-from-eslrc',
      }, {
        label: t('topBar.menu.importLyricFromYrc'), key: 'import-from-yrc',
      }, {
        label: t('topBar.menu.importLyricFromQrc'), key: 'import-from-qrc',
      }, {
        label: t('topBar.menu.importLyricFromLys'), key: 'import-from-lys',
      }]
    },
    {
      label: t('topBar.menu.exportLyric'), key: 'export-to', icon: renderIcon(ArrowExportRtl24Regular), children: [{
        label: t('topBar.menu.exportLyricToLrc'), key: 'export-to-lrc',
      }, {
        label: t('topBar.menu.exportLyricToEslrc'), key: 'export-to-eslrc',
      }, {
        label: t('topBar.menu.exportLyricToYrc'), key: 'export-to-yrc',
      }, {
        label: t('topBar.menu.exportLyricToQrc'), key: 'export-to-qrc',
      }, {
        label: t('topBar.menu.exportLyricToLys'), key: 'export-to-lys',
      }, {
        label: t('topBar.menu.exportLyricToAss'), key: 'export-to-ass',
      }]
    },
    {label: t('topBar.menu.importFromAMLLDB'), key: 'import-from-amll-db', icon: renderIcon(CloudArrowDown24Regular)},
    {label: t('topBar.menu.uploadToAMLLDB'), key: 'submit-to-amll-db', icon: renderIcon(CloudArrowUp24Regular)},
    {type: 'divider'},
    {label: t('topBar.menu.settings'), key: 'settings', icon: renderIcon(Settings24Regular)},
    {label: t('topBar.menu.about'), key: 'about', icon: renderIcon(Info24Regular)},
  ] as DropdownMixedOption[],
  edit: [
    {label: t('topBar.menu.undo'), key: 'undo', icon: renderIcon(ArrowUndo24Regular)},
    {label: t('topBar.menu.redo'), key: 'redo', icon: renderIcon(ArrowRedo24Regular)},
    {label: t('topBar.menu.selectAllLines'), key: 'select-all', icon: renderIcon(SelectAllOn24Regular)},
    {label: t('topBar.menu.unselectAllLines'), key: 'unselect-all', icon: renderIcon(SelectAllOff24Regular)},
    {label: t('topBar.menu.invertSelectAllLines'), key: 'invert-select-all', icon: renderIcon(MultiselectLtr24Regular)},
    {type: 'divider'},
    {label: t('topBar.menu.toggleBGLineOnSelectedLines'), key: 'toggle-bg', icon: renderIcon(VideoBackgroundEffect24Regular)},
    {label: t('topBar.menu.toggleDuetLineOnSelectedLines'), key: 'toggle-duet', icon: renderIcon(TextAlignRight24Filled)},
    {type: 'divider'},
    {label: t('topBar.menu.editMetadata'), key: 'edit-metadata', icon: renderIcon(TextBulletListSquareEdit24Regular)},
  ] as DropdownMixedOption[],
  view: [
    {label: t('topBar.menu.showTranslatedLyricLines'), key: 'show-tran'},
    {label: t('topBar.menu.showRomanLyricLines'), key: 'show-roman'},
    {label: t('topBar.menu.showMachineRomanji'), key: 'show-jpn-romaji'},
  ],
  tool: [
    {label: t('topBar.menu.splitWordBySimpleMethod'), key: 'split-words-simple'},
    {label: t('topBar.menu.splitWordByJieba'), key: 'split-words-jieba'},
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
        try {
          const text = await fileDialog.files?.[0]?.text();
          if (text) {
            const result = parseLyric(text);
            lyric.loadLyric(result);
          }
        } catch (err) {
          notify.error({
            title: "加载歌词失败",
            content: String(err),
          })
        }
      });
      fileDialog.remove();
      break;
    }
    case "open-from-clipboard": {
      navigator.clipboard.readText().then(text => {
        if (text.trim().length > 0) {
          try {
            const result = parseLyric(text);
            lyric.loadLyric(result);
          } catch (err) {
            notify.error({
              title: "加载歌词失败",
              content: String(err),
            })
          }
        } else {
          notify.error({
            title: "加载歌词失败",
            content: "剪切板没有任何数据"
          })
        }
      }).catch(err => {
        notify.error({
          title: "加载歌词失败",
          content: String(err),
        })
      });
      break;
    }
    case "import-from-text": {
      dialogs.importFromText = true;
      break;
    }
    case "import-from-lrc": {
      const fileDialog = document.createElement("input");
      fileDialog.type = "file";
      fileDialog.accept = ".lrc, */*";
      fileDialog.click();
      fileDialog.addEventListener("input", async () => {
        try {
          const text = await fileDialog.files?.[0]?.text();
          if (text) lyric.loadLRC(text);
        } catch (err) {
          notify.error({
            title: "导入 LRC 歌词失败",
            content: String(err),
          })
        }
      });
      fileDialog.remove();
      break;
    }
    case "import-from-eslrc": {
      const fileDialog = document.createElement("input");
      fileDialog.type = "file";
      fileDialog.accept = ".lrc, */*";
      fileDialog.click();
      fileDialog.addEventListener("input", async () => {
        try {
          const text = await fileDialog.files?.[0]?.text();
          if (text) lyric.loadESLRC(text);
        } catch (err) {
          notify.error({
            title: "导入 ESLyric 歌词失败",
            content: String(err),
          })
        }
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
        try {
          const text = await fileDialog.files?.[0]?.text();
          if (text) lyric.loadYRC(text);
        } catch (err) {
          notify.error({
            title: "导入 YRC 歌词失败",
            content: String(err),
          })
        }
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
        try {
          const text = await fileDialog.files?.[0]?.text();
          if (text) lyric.loadQRC(text);
        } catch (err) {
          notify.error({
            title: "导入 QRC 歌词失败",
            content: String(err),
          })
        }
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
        try {
          const text = await fileDialog.files?.[0]?.text();
          if (text) lyric.loadLYS(text);
        } catch (err) {
          notify.error({
            title: "导入 Lyricify Syllable 歌词失败",
            content: String(err),
          })
        }
      });
      fileDialog.remove();
      break;
    }
    case "save": {
      try {
        const output = lyric.toTTML();
        saveFile(new TextEncoder().encode(output), "lyric.ttml");
      } catch (err) {
        notify.error({
          title: "保存失败",
          content: String(err),
        })
      }
      break;
    }
    case "save-to-clipboard": {
      const output = lyric.toTTML();
      navigator.clipboard.writeText(output)
          .then(() => {
            notify.success({
              title: "保存到剪贴板成功",
              content: "已将歌词保存到剪贴板",
              duration: 3000,
            })
          }).catch(err => {
        notify.error({
          title: "保存到剪贴板失败",
          content: String(err),
        })
      });
      break;
    }
    case "export-to-lrc": {
      try {
        const output = lyric.toLRC();
        saveFile(new TextEncoder().encode(output), "lyric.lrc");
      } catch (err) {
        notify.error({
          title: "导出 LRC 歌词失败",
          content: String(err),
        })
      }
      break;
    }
    case "export-to-eslrc": {
      try {
        const output = lyric.toESLRC();
        saveFile(new TextEncoder().encode(output), "lyric.lrc");
      } catch (err) {
        notify.error({
          title: "导出 ESLyric 歌词失败",
          content: String(err),
        })
      }
      break;
    }
    case "export-to-yrc": {
      try {
        const output = lyric.toYRC();
        saveFile(new TextEncoder().encode(output), "lyric.yrc");
      } catch (err) {
        notify.error({
          title: "导出 YRC 歌词失败",
          content: String(err),
        })
      }
      break;
    }
    case "export-to-qrc": {
      try {
        const output = lyric.toQRC();
        saveFile(new TextEncoder().encode(output), "lyric.qrc");
      } catch (err) {
        notify.error({
          title: "导出 QRC 歌词失败",
          content: String(err),
        })
      }
      break;
    }
    case "export-to-lys": {
      try {
        const output = lyric.toLYS();
        saveFile(new TextEncoder().encode(output), "lyric.lys");
      } catch (err) {
        notify.error({
          title: "导出 Lyricify Syllable 歌词失败",
          content: String(err),
        })
      }
      break;
    }
    case "export-to-ass": {
      const output = lyric.toASS();
      saveFile(new TextEncoder().encode(output), "lyric.ass");
      break;
    }
    case "import-from-amll-db": {
      dialogs.importFromDB = true;
      break;
    }
    case "submit-to-amll-db": {
      dialogs.submitLyric = true;
      break;
    }
    case "settings": {
      dialogs.settings = true;
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
    case "edit-metadata": {
      dialogs.metadata = true;
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
    case "show-jpn-romaji": {
      settings.showJpnRomaji = !settings.showJpnRomaji;
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
    case "split-words-simple": {
      lyric.splitLineBySimpleMethod();
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
