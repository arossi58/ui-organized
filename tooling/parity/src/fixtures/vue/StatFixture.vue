<script setup lang="ts">
import { Stat } from "@ui-organized/vue";
// `chart` stands for the chart slot; see cases/Stat.tsx.
defineProps<{ chart?: boolean }>();
</script>

<template>
  <Stat v-bind="$attrs as any">
    <template v-if="chart" #chart><span class="parity-chart">Chart</span></template>
  </Stat>
</template>
