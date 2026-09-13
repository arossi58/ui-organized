<!--
  Reusable inline error message for form controls (Input, Select, ...).

  Renders a filled alert icon followed by the message on a subdued error-tinted
  pill. Use it standalone, or as the `asChild` target of an Ark `Field.ErrorText`
  so the message stays wired to the control through `aria-describedby`.
-->
<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import { clsx } from "clsx";
import Icon from "../Icon/Icon.vue";
import type { FieldErrorProps } from "./FieldError.types.js";
import "@ui-organized/core/components/FieldError/FieldError.css";

defineOptions({ inheritAttrs: false });
const props = defineProps<FieldErrorProps>();
const attrs = useAttrs();
const slots = useSlots();

const empty = computed(() => !slots.default && (props.message == null || props.message === ""));
const rootClass = computed(() =>
  clsx("field-error", "text-emphasis-caption", attrs.class as string),
);
</script>

<template>
  <span v-if="!empty" :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <Icon name="alert-circle" :size="12" class="field-error__icon" />
    <slot>{{ message }}</slot>
  </span>
</template>
