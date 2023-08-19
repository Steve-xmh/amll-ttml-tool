<template>
    <NModal transform-origin="center" :show="settings.showingTutorial">
        <NCard :title="$t('tutorial.title')" style="max-width: 800px;">
            <NSpace vertical style="white-space: pre-line; line-height: 2rem;">
                <i18n-t keypath="tutorial.content" />
                <NAlert type="warning">
                    <i18n-t keypath="tutorial.wipWarning" />
                </NAlert>
                <NSteps vertical>
                    <NStep :title="$t('tutorial.step1.title')">
                        <i18n-t keypath="tutorial.step1.content" />
                    </NStep>
                    <NStep :title="$t('tutorial.step2.title')">
                        <i18n-t keypath="tutorial.step2.content">
                            <NButton>{{ $t("tutorial.step2.editModeBtnExample") }}</NButton>
                        </i18n-t>
                    </NStep>
                    <NStep :title="$t('tutorial.step3.title')">
                        <i18n-t keypath="tutorial.step3.content">
                            <NButton>{{ $t("tutorial.step3.syncModeBtnExample") }}</NButton>
                        </i18n-t>
                        <table>
                            <tr>
                                <th><i18n-t keypath="tutorial.step3.shortcutsTable.header.key" /></th>
                                <th><i18n-t keypath="tutorial.step3.shortcutsTable.header.description" /></th>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t keypath="tutorial.step3.shortcutsTable.moveToPreviousWord.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t keypath="tutorial.step3.shortcutsTable.moveToPreviousWord.description" /></td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t keypath="tutorial.step3.shortcutsTable.moveToNextWord.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t keypath="tutorial.step3.shortcutsTable.moveToNextWord.description" /></td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.moveToFirstWordOfPreviousLine.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t
                                        keypath="tutorial.step3.shortcutsTable.moveToFirstWordOfPreviousLine.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.moveToFirstWordOfNextLine.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t keypath="tutorial.step3.shortcutsTable.moveToFirstWordOfNextLine.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.moveToPreviousWordAndCurrentTime.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t
                                        keypath="tutorial.step3.shortcutsTable.moveToPreviousWordAndCurrentTime.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.moveToNextWordAndSetCurrentTime.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t
                                        keypath="tutorial.step3.shortcutsTable.moveToNextWordAndSetCurrentTime.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.setWordStartTimeToCurrentTime.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t
                                        keypath="tutorial.step3.shortcutsTable.setWordStartTimeToCurrentTime.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.moveNextAndSetWordTime.key" /></NButton>
                                </td>
                                <td><i18n-t keypath="tutorial.step3.shortcutsTable.moveNextAndSetWordTime.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.moveNextAndSetWordEndTimeOnly.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t
                                        keypath="tutorial.step3.shortcutsTable.moveNextAndSetWordEndTimeOnly.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.decreasePlaybackSpeed.key" /></NButton>
                                </td>
                                <td><i18n-t keypath="tutorial.step3.shortcutsTable.decreasePlaybackSpeed.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t
                                            keypath="tutorial.step3.shortcutsTable.increasePlaybackSpeed.key" /></NButton>
                                </td>
                                <td><i18n-t keypath="tutorial.step3.shortcutsTable.increasePlaybackSpeed.description" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t keypath="tutorial.step3.shortcutsTable.resetPlaybackSpeed.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t keypath="tutorial.step3.shortcutsTable.resetPlaybackSpeed.description" /></td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block><i18n-t keypath="tutorial.step3.shortcutsTable.resumeOrPauseMusic.key" />
                                    </NButton>
                                </td>
                                <td><i18n-t keypath="tutorial.step3.shortcutsTable.resumeOrPauseMusic.description" /></td>
                            </tr>
                        </table>
                    </NStep>
                    <NStep :title="$t('tutorial.step4.title')">
                    <i18n-t keypath="tutorial.step4.content" />
                </NStep>
                <NStep :title="$t('tutorial.step5.title')">
                    <NAlert type="warning">
                        <i18n-t keypath="tutorial.step5.ncmOnlyWarning" />
                    </NAlert>
                    <i18n-t keypath="tutorial.step5.content">
                        <a href="https://github.com/Steve-xmh/amll-ttml-db">
                            {{ $t("tutorial.step5.amllTtmlDbUrlName") }}
                        </a>
                    </i18n-t>
                </NStep>
            </NSteps>
            <i18n-t keypath="tutorial.ending" />
        </NSpace>
        <template #footer>
            <NButton type="primary" @click="settings.showingTutorial = false">
                <i18n-t keypath="tutorial.closeBtn" />
            </NButton>
        </template>
    </NCard>
</NModal></template>

<script setup lang="ts">
import { NCard, NModal, NSteps, NStep, NSpace, NButton, NAlert } from 'naive-ui';
import { useSettings } from '../../store';

const settings = useSettings();

</script>
