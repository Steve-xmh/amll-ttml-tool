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
const { t } = useI18n({ useScope: "global" });

</script>
