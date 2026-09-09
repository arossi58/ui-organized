<!--
  Action row pinned to the bottom of the panel, holding the sheet's buttons.
  Fills the row on narrow (left/right) sheets, right-aligns on wide ones.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rootClass = computed(() => clsx("dialog__footer", "sheet__footer", attrs.class as string));
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }"><slot /></div>
</template>
