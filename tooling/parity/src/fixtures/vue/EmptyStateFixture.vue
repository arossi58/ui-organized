<script setup lang="ts">
import { Button, EmptyState } from "@ui-organized/vue";

// `withActions` stands for the slot; see EmptyState.tsx.
defineProps<{ withActions?: boolean }>();
</script>

<template>
  <EmptyState v-bind="$attrs as any">
    <template v-if="withActions" #actions><Button>Clear filters</Button></template>
  </EmptyState>
</template>
