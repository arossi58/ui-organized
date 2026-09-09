<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Field as ArkField } from "@ark-ui/vue";
import { clsx } from "clsx";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rootClass = computed(() => clsx("field__control", attrs.class as string));
</script>

<template>
  <ArkField.Input :class="rootClass" v-bind="{ ...$attrs, class: undefined }" />
</template>
