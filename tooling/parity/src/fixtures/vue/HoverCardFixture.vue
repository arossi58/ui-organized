<script setup lang="ts">
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@ui-organized/vue";
defineProps<{ contentProps?: Record<string, unknown> }>();
</script>

<template>
  <HoverCard v-bind="$attrs">
    <HoverCardTrigger>Profile</HoverCardTrigger>
    <HoverCardContent v-bind="contentProps">Preview</HoverCardContent>
  </HoverCard>
</template>
