<template>
    <NList>
        <NListItem v-for="(line, i) in lyric.lyrics" :key="i" style="padding: 12px">
            {{ line.words.map((word) => word.word).join("") }}
        </NListItem>
    </NList>
</template>

<script setup lang="ts">
import { NButton, NList, NListItem } from "naive-ui";
import { useEditingLyric } from '../store';

const lyric = useEditingLyric();
</script>
