<script setup lang="ts">
import { SectionHeader } from "@ui-organized/vue";
// `withActions` stands for the slot; see cases/SectionHeader.tsx.
defineProps<{ withActions?: boolean }>();
</script>

<template>
  <SectionHeader v-bind="$attrs as any">
    <template v-if="withActions" #actions><button type="button">View all</button></template>
  </SectionHeader>
</template>
