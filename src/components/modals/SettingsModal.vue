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
  <NModal :show="dialogs.settings" :title="t('settingsDialog.title')" mask-closable preset="card"
          style="max-width: 600px;" transform-origin="center" @close="dialogs.settings = false">
    <NTabs animated type="line">
      <NTabPane key="common" :name="t('settingsDialog.tab.common')" class="setting-grid">
        <div>
          <i18n-t keypath="settingsDialog.common.showTranslateLine"/>
        </div>
        <div>
          <NSwitch v-model:value="settings.showTranslateLine"/>
        </div>

        <div>
          <i18n-t keypath="settingsDialog.common.showRomanLine"/>
        </div>
        <div>
          <NSwitch v-model:value="settings.showRomanLine"/>
        </div>

        <div>
          <i18n-t keypath="settingsDialog.common.showJpnRomaji"/>
        </div>
        <div>
          <NSwitch v-model:value="settings.showJpnRomaji"/>
        </div>

        <div>
          <i18n-t keypath="settingsDialog.common.volume"/>
        </div>
        <div>
          <NSlider v-model:value="settings.volume" :format-tooltip="(v) => `${(v * 100) | 0}%`" :max="1.0" :min="0.0"
                   :step="0.01"
                   style="width: 10em"/>
        </div>

        <div>
          <i18n-t keypath="settingsDialog.common.speed"/>
        </div>
        <div>
          <NSlider v-model:value="settings.speed" :format-tooltip="(v) => `${v.toFixed(2)}x`" :max="4.0" :min="0.25"
                   :step="0.01"
                   style="width: 10em"/>
        </div>
      </NTabPane>
      <NTabPane key="shortcut" :name="t('settingsDialog.tab.keybindings')" class="setting-grid">
        <div>
          <i18n-t keypath="settingsDialog.keybindings.seekPlayForward5s"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.seekPlayForward5s" :default="['ArrowRight']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.seekPlayBackward5s"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.seekPlayBackward5s" :default="['ArrowLeft']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.seekPlayForward1s"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.seekPlayForward1s" :default="[]"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.seekPlayBackward1s"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.seekPlayBackward1s" :default="[]"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.seekPlayForward100ms"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.seekPlayForward100ms" :default="[]"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.seekPlayBackward100ms"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.seekPlayBackward100ms" :default="[]"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.volumeUp"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.volumeUp" :default="['ArrowUp']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.volumeDown"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.volumeDown" :default="['ArrowDown']"/>
        </div>

        <div/>
        <div/>

        <div>
          <i18n-t keypath="settingsDialog.keybindings.moveLeftWord"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.moveLeftWord" :default="['KeyA']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.moveRightWord"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.moveRightWord" :default="['KeyD']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.moveUpLine"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.moveUpLine" :default="['KeyW']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.moveDownLine"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.moveDownLine" :default="['KeyS']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.seekLeftWord"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.seekLeftWord" :default="['KeyR']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.seekRightWord"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.seekRightWord" :default="['KeyY']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.setCurWordStartTime"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.setCurWordStartTime" :default="['KeyF']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.stepWordAndSetTime"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.stepWordAndSetTime" :default="['KeyG']"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.stepWordAndSetTimeAlias1"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.stepWordAndSetTimeAlias1" :default="[]"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.stepWordAndSetTimeAlias2"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.stepWordAndSetTimeAlias2" :default="[]"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.stepWordAndSetTimeAlias3"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.stepWordAndSetTimeAlias3" :default="[]"/>
        </div>
        <div>
          <i18n-t keypath="settingsDialog.keybindings.stepWordAndSetEndTime"/>
        </div>
        <div>
          <ShortcutInput v-model="settings.keybindings.stepWordAndSetEndTime" :default="['KeyH']"/>
        </div>
      </NTabPane>
    </NTabs>
  </NModal>
</template>

<script lang="ts" setup>
import {useDialogs, useSettings} from "../../store";
import {NModal, NSlider, NSwitch, NTabPane, NTabs} from "naive-ui";
import {useI18n} from "vue-i18n";
import ShortcutInput from "../ShortcutInput.vue";

const dialogs = useDialogs();
const settings = useSettings();
const {t} = useI18n({useScope: "global"});

</script>

<style lang="sass" scoped>
.setting-grid
  display: grid
  grid-template-columns: 1fr 1fr
  text-overflow: ellipsis
  align-items: baseline

  > *
    padding: 0.5em 1em
    align-self: center
    display: block

    &:nth-child(even)
      justify-self: flex-end

</style>
