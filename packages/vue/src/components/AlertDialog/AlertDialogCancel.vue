<!-- Dismisses the dialog without acting. Styled as a secondary button. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import { clsx } from "clsx";
import { buttonStyles } from "@ui-organized/core";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const buttonClass = computed(() =>
  clsx(buttonStyles({ intent: "secondary" }), attrs.class as string),
);
</script>

<template>
  <ArkDialog.CloseTrigger :class="buttonClass" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </ArkDialog.CloseTrigger>
</template>
