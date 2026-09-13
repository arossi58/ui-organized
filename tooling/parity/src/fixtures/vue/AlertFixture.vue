<script setup lang="ts">
import { Alert } from "@ui-organized/vue";

// `onDismiss` arrives as a boolean — see the note in cases/Alert.tsx. Vue keys
// the dismiss button off the presence of a callback exactly as React does, so
// the fixture supplies one rather than translating to a different prop.
defineOptions({ inheritAttrs: false });
defineProps<{ children?: string; onDismiss?: boolean }>();
const noop = () => {};
</script>

<template>
  <Alert v-bind="{ ...$attrs, ...(onDismiss ? { onDismiss: noop } : {}) }">{{
    children ?? "Something happened"
  }}</Alert>
</template>
