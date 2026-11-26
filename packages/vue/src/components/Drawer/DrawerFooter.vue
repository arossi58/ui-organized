<!-- The action row. Its buttons fill the row, the reachable ones on a phone. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { DRAWER_CLASS } from "@ui-organized/core";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rootClass = computed(() => clsx(DRAWER_CLASS.footer, attrs.class as string));
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }"><slot /></div>
</template>
