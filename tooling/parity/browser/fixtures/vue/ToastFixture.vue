<script setup lang="ts">
import { ToastProvider, useToastManager, type ToastOptions } from "@ui-organized/vue";

const props = withDefaults(defineProps<{ toasts?: ToastOptions[] }>(), { toasts: () => [] });
const toast = useToastManager();

function fire() {
  props.toasts.forEach((t) => toast.add(t));
}
</script>

<template>
  <ToastProvider>
    <button id="fire" @click="fire">Fire</button>
  </ToastProvider>
</template>
