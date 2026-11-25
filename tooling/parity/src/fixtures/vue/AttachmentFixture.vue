<script setup lang="ts">
import { Attachment } from "@ui-organized/vue";

// `removable` / `retryable` stand for the handlers; see cases/Attachment.tsx.
defineProps<{ removable?: boolean; retryable?: boolean }>();
const noop = () => {};
</script>

<template>
  <Attachment v-bind="$attrs" :on-remove="removable ? noop : undefined" :on-retry="retryable ? noop : undefined" />
</template>
