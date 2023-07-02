<template>
    <NModal transform-origin="center" :show="currentProgresses.length > 0">
        <NCard title="处理中" style="max-width: 500px;">
            <div v-for="progress, i in currentProgresses" :key="i">
                <div>{{ progress.label }}</div>
                <NProgress :percentage="Math.round(progress.progress * 100)" type="line" />
            </div>
        </NCard>
    </NModal>
</template>

<script setup lang="ts">
import {
    NModal,
    NCard,
    NProgress,
} from "naive-ui";
import { useProgress } from "../store";
import { storeToRefs } from "pinia";

const { currentProgresses } = storeToRefs(useProgress());

</script>
