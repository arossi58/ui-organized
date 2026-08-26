<!--
  A static measurement inside a known range — disk usage, a score, a quota.

  Distinct from Progress, which tracks a task and can be indeterminate; a meter
  never can. Ark UI has no Meter primitive and none is needed: everything here is
  `role="meter"` plus the ARIA value attributes, so the facade owns the
  accessible markup directly.
-->
<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { clsx } from "clsx";
import { meterStyles } from "@ui-organized/core";
import type { MeterProps } from "./Meter.types.js";
import "@ui-organized/core/components/Meter/Meter.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<MeterProps>(), {
  min: 0,
  max: 100,
  showValue: false,
});
const attrs = useAttrs();

const clamped = computed(() => Math.min(Math.max(props.value, props.min), props.max));
const percent = computed(() =>
  props.max > props.min ? ((clamped.value - props.min) / (props.max - props.min)) * 100 : 0,
);
const formatted = computed(() => new Intl.NumberFormat(undefined, props.format).format(props.value));

const showHeader = computed(() => props.label != null || props.showValue);
const labelIsString = computed(() => typeof props.label === "string");
// `role="meter"` needs an accessible name: the caption when there is one,
// otherwise whatever the caller passes. A bare number is not a measurement.
const labelId = useId();

const rootClass = computed(() =>
  clsx(meterStyles({ variant: props.variant, size: props.size }), attrs.class as string),
);
</script>

<template>
  <div
    role="meter"
    :aria-valuenow="value"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuetext="formatted"
    :aria-labelledby="label != null ? labelId : undefined"
    :aria-label="label == null ? ariaLabel : undefined"
    :class="rootClass"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div v-if="showHeader" class="meter__header text-default-body-small">
      <span v-if="label != null" :id="labelId" class="meter__label">
        <template v-if="labelIsString">{{ label }}</template>
        <component :is="label" v-else />
      </span>
      <span v-if="showValue" class="meter__value">{{ formatted }}</span>
    </div>
    <div class="meter__track">
      <div class="meter__indicator" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>
