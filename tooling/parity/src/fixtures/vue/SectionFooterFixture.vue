<script setup lang="ts">
import { SectionFooter } from "@ui-organized/vue";
// `text` stands for the status line, `withActions` for the slot; see cases/SectionFooter.tsx.
defineProps<{ text?: string; withActions?: boolean }>();
</script>

<template>
  <SectionFooter v-bind="$attrs as any">
    <template v-if="text" #default>{{ text }}</template>
    <template v-if="withActions" #actions><button type="button">Next</button></template>
  </SectionFooter>
</template>
