<!-- Groups related fields under a shared legend. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Fieldset as ArkFieldset } from "@ark-ui/vue";
import { clsx } from "clsx";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rootClass = computed(() => clsx("fieldset", attrs.class as string));
</script>

<template>
  <ArkFieldset.Root :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </ArkFieldset.Root>
</template>
