<!--
  A prominent message about the state of something.

  `role="alert"` is the component's own, not the caller's job: an alert that
  assistive technology does not announce is a coloured box.

  There is no Ark machine behind this one — Ark UI has no Alert primitive — so
  the markup here *is* the contract, and it is compared against the React
  library's element for element by the parity gate.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { alertStyles } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import Icon from "../Icon/Icon.vue";
import type { AlertProps } from "./Alert.types.js";
import "@ui-organized/core/components/Alert/Alert.css";

/** Each variant announces itself with its own glyph before anyone reads the text. */
const VARIANT_ICONS: Record<NonNullable<AlertProps["variant"]>, CanonicalIconName> = {
  info:    "info",
  success: "check-circle",
  warning: "alert-triangle",
  error:   "alert-circle",
};

const ICON_SIZE = 20;

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<AlertProps>(), { variant: "info" });
const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(alertStyles({ variant: props.variant }), attrs.class as string),
);
</script>

<template>
  <div role="alert" :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <span class="alert__icon">
      <Icon :name="VARIANT_ICONS[variant]" :size="ICON_SIZE" />
    </span>
    <div class="alert__body">
      <div v-if="title" class="alert__title text-strong-body-medium">{{ title }}</div>
      <div class="alert__message text-default-body-medium"><slot /></div>
    </div>
    <button
      v-if="onDismiss"
      type="button"
      class="alert__dismiss"
      aria-label="Dismiss alert"
      @click="onDismiss()"
    >
      <Icon name="close" :size="ICON_SIZE" />
    </button>
  </div>
</template>
