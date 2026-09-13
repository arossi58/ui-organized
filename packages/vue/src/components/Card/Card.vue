<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { cardStyles } from "@ui-organized/core";
import type { CardProps } from "./Card.types.js";
import "@ui-organized/core/components/Card/Card.css";

defineOptions({ inheritAttrs: false });
const props = defineProps<CardProps>();
const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(cardStyles({ variant: props.variant, padding: props.padding }), attrs.class as string),
);
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }"><slot /></div>
</template>
