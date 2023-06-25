<template>
    <NConfigProvider :theme="darkTheme">
        <NLayout position="absolute" content-style="display: flex; flex-direction: column;">
            <NLayoutHeader bordered style="padding: 16px; display: flex; align-items: center">
                <NDropdown trigger="click" :options="[
                    { label: 'New lyric', key: 'new' },
                    { label: 'Open lyric', key: 'open' },
                    { type: 'divider' },
                    { label: 'Save lyric', key: 'save' },
                    { label: 'Save lyric as', key: 'save-as' },
                    { type: 'divider' },
                    { label: 'Import lyric', key: 'import' },
                    { label: 'Export lyric', key: 'export' },
                    { type: 'divider' },
                    { label: 'Settings', key: 'setting' },
                    { label: 'About', key: 'about' },
                ]">
                    <NButton quaternary>Files</NButton>
                </NDropdown>
                <NDropdown trigger="click" :options="[
                    { label: 'Undo', key: 'undo' },
                    { label: 'Redo', key: 'redo' },
                ]">
                    <NButton quaternary>Edit</NButton>
                </NDropdown>
                <div style="flex: 1; display: flex; justify-content: center;">
                    <NButton quaternary>Edit</NButton>
                    <NButton quaternary>Sync</NButton>
                </div>
                <div>Apple Music-like Lyrics TTML Tool</div>
            </NLayoutHeader>
            <NLayoutContent style="flex: 1">Test</NLayoutContent>
            <NLayoutFooter bordered style="padding: 16px">Test</NLayoutFooter>
        </NLayout>
    </NConfigProvider>
</template>

<script setup lang="ts">
import {
    NMenu,
    NConfigProvider,
    darkTheme,
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NDropdown,
    NButton,
} from "naive-ui";
</script>

<style lang="sass"></style>
