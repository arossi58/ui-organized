<script setup lang="ts">
import { Button, Calendar } from "@ui-organized/vue";

// `withFooter` stands for the footer slot; see cases/Calendar.tsx.
defineProps<{ withFooter?: boolean }>();
</script>

<template>
  <Calendar v-bind="$attrs">
    <template v-if="withFooter" #footer><Button intent="primary" size="sm">Apply</Button></template>
  </Calendar>
</template>
