<template>
    <NModal transform-origin="center" :show="currentProgresses.length > 0">
        <NCard :title="t('ProgressOverlay.title')" style="max-width: 500px;">
            <div v-for="progress, i in currentProgresses" :key="i">
                <div>{{ t(progress.label) }}</div>
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
import { useProgress } from "../../store";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

const { currentProgresses } = storeToRefs(useProgress());
const { t } = useI18n();

</script>
