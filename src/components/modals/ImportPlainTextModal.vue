<template>
    <NModal preset="card" @close="dialogs.importFromText = false"
        :class="{ 'import-plain-text-modal': true, 'fullscreen': inputs.fullscreen }"
        content-style="display:flex;gap:16px;align-items:stretch;max-height:100%;overflow:hidden;" :show="dialogs.importFromText" transform-origin="center"
        :title="t('importPlainTextModal.title')">
        <template #header-extra>
            <NButton @click="inputs.fullscreen = !inputs.fullscreen" quaternary circle>
                <NIcon size="18">
                    <FullScreenMaximize16Filled />
                </NIcon>
            </NButton>
        </template>
        <div class="import-plain-text-editor">
            <Codemirror v-model:model-value="inputs.textContent" :placeholder="t('importPlainTextModal.textPlaceholder')" style="height: 100%" />
        </div>
        <div class="import-plain-text-options">
            <div>
                <i18n-t keypath="importPlainTextModal.importMode" />
                <NSelect v-model:value="inputs.importMode" :options="importModeOptions" />
                <i18n-t keypath="importPlainTextModal.lyricSplitMode" />
                <NSelect :disabled="inputs.importMode === 'lyric-only'" v-model:value="inputs.lyricSplitMode"
                    :options="lyricSplitModeOptions" />
                <i18n-t keypath="importPlainTextModal.sameLineSeparator" />
                <NInput :disabled="inputs.importMode === 'lyric-only' || inputs.lyricSplitMode === 'interleaved-line'"
                    v-model:value="inputs.sameLineSeparator"
                    :placeholder="t('importPlainTextModal.sameLineSeparatorPlaceholder')" />
                <i18n-t keypath="importPlainTextModal.swapTransAndRoman" />
                <NCheckbox :disabled="inputs.importMode === 'lyric-only' || inputs.importMode === 'lyric-with-translation'"
                    v-model:checked="inputs.swapTransAndRoman" style="justify-self: flex-end;" />
                <i18n-t keypath="importPlainTextModal.wordSeparator" />
                <NInput v-model:value="inputs.wordSeparator"
                    :placeholder="t('importPlainTextModal.wordSeparatorPlaceholder')" />
            </div>
            <div>
                <NButton type="primary" @click="importLyric">
                    <i18n-t keypath="importPlainTextModal.importBtn" />
                </NButton>
            </div>
        </div>
    </NModal>
</template>

<script setup lang="ts">
import { NModal, NInput, NIcon, NButton, NSelect, useNotification, type SelectOption, NCheckbox } from 'naive-ui';
import { FullScreenMaximize16Filled } from "@vicons/fluent";
import { useEditingLyric, useDialogs } from '../../store';
import { useI18n } from "vue-i18n";
import { reactive } from "vue";
import { Codemirror } from 'vue-codemirror'
import type { LyricLine } from '../../store/lyric';

const lyric = useEditingLyric();
const dialogs = useDialogs();
const { t } = useI18n({ useScope: "global" });

const inputs = reactive({
    textContent: "",
    fullscreen: false,
    importMode: "lyric-only",
    lyricSplitMode: "interleaved-line",
    sameLineSeparator: "|",
    swapTransAndRoman: false,
    wordSeparator: "\\",
});

const importModeOptions: SelectOption[] = [{
    label: t("importPlainTextModal.lyricOnly"),
    value: "lyric-only",
}, {
    label: t("importPlainTextModal.lyricWithTranslation"),
    value: "lyric-with-translation",
}, {
    label: t("importPlainTextModal.lyricWithTranslationAndRoman"),
    value: "lyric-with-translation-and-roman",
}];

const lyricSplitModeOptions: SelectOption[] = [{
    label: t("importPlainTextModal.interleavedLine"),
    value: "interleaved-line",
}, {
    label: t("importPlainTextModal.sameLineWithSeparator"),
    value: "same-line-separator",
}];

function importLyric() {
    const origLines = inputs.textContent.split("\n");
    const result: LyricLine[] = [];

    function addLine(orig = "", trans = "", roman = "") {
        result.push({
            words: [{
                word: orig,
                startTime: 0,
                endTime: 0,
            }],
            translatedLyric: trans,
            romanLyric: roman,
            isBG: false,
            isDuet: false,
            selected: false,
        });
    }

    function addAsLyricOnly() {
        for (const origLine of origLines) {
            addLine(origLine);
        }
    }

    switch (inputs.importMode) {
        case "lyric-with-translation": {
            switch (inputs.lyricSplitMode) {
                case "interleaved-line": {
                    for (let i = 0; i < origLines.length; i += 2) {
                        addLine(origLines[i], origLines[i + 1]);
                    }
                    break;
                }
                case "same-line-separator": {
                    if (inputs.sameLineSeparator === "") {
                        addAsLyricOnly();
                    } else {
                        for (const origLine of origLines) {
                            const [orig, trans] = origLine.split(inputs.sameLineSeparator);
                            addLine(orig, trans);
                        }
                    }
                    break;
                }
                default:
                    return;
            }
            break;
        }
        case "lyric-with-translation-and-roman": {
            switch (inputs.lyricSplitMode) {
                case "interleaved-line": {
                    for (let i = 0; i < origLines.length; i += 3) {
                        addLine(origLines[i], origLines[i + 1], origLines[i + 2]);
                    }
                    break;
                }
                case "same-line-separator": {
                    if (inputs.sameLineSeparator === "") {
                        addAsLyricOnly();
                    } else {
                        for (const origLine of origLines) {
                            const [orig, trans, roman] = origLine.split(inputs.sameLineSeparator);
                            addLine(orig, trans, roman);
                        }
                    }
                    break;
                }
                default:
                    return;
            }
            break;
        }
        case "lyric-only":
            addAsLyricOnly();
            break;
        default:
            return;
    }

    if (inputs.swapTransAndRoman) {
        result.forEach(line => {
            [line.romanLyric, line.translatedLyric] = [line.translatedLyric, line.romanLyric];
        });
    }

    if (inputs.wordSeparator.length > 0) {
        result.forEach(line => {
            const wholeLine = line.words.map(v => v.word).join("");
            line.words = wholeLine.split(inputs.wordSeparator).map(word => ({
                word,
                startTime: 0,
                endTime: 0,
            }));
        });
    }

    lyric.lyrics = result;
    lyric.record();
    dialogs.importFromText = false;
}

</script>

<style lang="sass">
.import-plain-text-modal
    max-width: max(800px, 80vw)
    min-height: min(100vh, 500px)
    max-height: 100vh
    &.fullscreen
        max-width: unset
        min-height: unset
        width: 100vw
        height: 100vh
.import-plain-text-editor
    flex: 2
    min-width: 0
    border: solid 1px #4444
    border-radius: 4px
    position: relative
    overflow: hidden
    *
        font-family: 'Fira Code', 'PingFang SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', 'Courier New', Courier, monospace
.import-plain-text-options
    flex: 2
    display: flex
    flex-direction: column
    justify-content: space-between
    > *:last-child
        align-self: flex-end
    > *:first-child
        display: grid
        grid-template-columns: auto auto
        grid-template-rows: auto auto auto
        align-items: center
        max-width: 100%
        gap: 8px
</style>