<!-- Button that toggles the panel. Pass `as-child` to project a custom element. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Collapsible as ArkCollapsible } from "@ark-ui/vue";
import { clsx } from "clsx";
import type { CollapsibleTriggerProps } from "./Collapsible.types.js";

defineOptions({ inheritAttrs: false });
defineProps<CollapsibleTriggerProps>();

const attrs = useAttrs();
const triggerClass = computed(() =>
  clsx("collapsible__trigger", "text-emphasis-body-large", attrs.class as string),
);
</script>

<template>
  <ArkCollapsible.Trigger
    :as-child="asChild"
    :class="triggerClass"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </ArkCollapsible.Trigger>
</template>
