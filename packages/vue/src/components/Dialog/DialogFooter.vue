<!-- Right-aligned action row, typically holding the dialog's buttons. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rootClass = computed(() => clsx("dialog__footer", attrs.class as string));
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }"><slot /></div>
</template>
