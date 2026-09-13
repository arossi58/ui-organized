<!--
  The root: size, variant, and the element every part measures itself against.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { getRootProps } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";

defineProps<{ class?: string }>();
const table = useTableContext();
const root = computed(() => getRootProps(table.chrome.value));
</script>

<template>
  <div
    :ref="(el) => (table.rootRef.value = el as HTMLElement | null)"
    v-bind="vueProps(root)"
    :class="clsx(root.className, $props.class)"
  >
    <slot />
  </div>
</template>
