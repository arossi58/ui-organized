<!-- Optional wrapper to visually cluster a subset of toolbar controls. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rootClass = computed(() => clsx("toolbar__group", attrs.class as string));
</script>

<template>
  <div role="group" :class="rootClass" v-bind="{ ...$attrs, class: undefined }"><slot /></div>
</template>
