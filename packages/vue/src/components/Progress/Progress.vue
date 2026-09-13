<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Progress as ArkProgress } from "@ark-ui/vue";
import { clsx } from "clsx";
import { progressStyles } from "@ui-organized/core";
import type { ProgressProps } from "./Progress.types.js";
import "@ui-organized/core/components/Progress/Progress.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ProgressProps>(), {
  value: null,
  max: 100,
  showValue: false,
  shape: "linear",
});
const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(
    progressStyles({ variant: props.variant, size: props.size, shape: props.shape }),
    attrs.class as string,
  ),
);
/**
 * Ark Vue calls this `modelValue`, not `value`.
 *
 * Its single-value controlled props are named for `v-model`, so `:value="40"` is
 * simply an unknown attribute and the machine falls back to its own default of
 * 50 — a progress bar that silently reads 50% for every value you give it. React
 * and Svelte both take `value`. The facade keeps `value` so the API matches, and
 * translates here.
 */
const arkValue = computed(() => props.value);

const showHeader = computed(() => props.label != null || props.showValue);
const isCircular = computed(() => props.shape === "circular");
const labelIsString = computed(() => typeof props.label === "string");
</script>

<template>
  <ArkProgress.Root :model-value="arkValue" :max="max" :class="rootClass">
    <div v-if="showHeader" class="progress__header text-default-body-small">
      <ArkProgress.Label v-if="label != null" class="progress__label">
        <template v-if="labelIsString">{{ label }}</template>
        <component :is="label" v-else />
      </ArkProgress.Label>
      <!--
        A ring has room inside it, so the value sits in the middle rather than in
        the header — see the circular branch below.
      -->
      <ArkProgress.ValueText v-if="showValue && !isCircular" class="progress__value" />
    </div>
    <div v-if="isCircular" class="progress__circle-wrap">
      <ArkProgress.Circle class="progress__circle">
        <ArkProgress.CircleTrack class="progress__circle-track" />
        <ArkProgress.CircleRange class="progress__circle-range" />
      </ArkProgress.Circle>
      <ArkProgress.ValueText
        v-if="showValue"
        class="progress__circle-value text-emphasis-body-medium"
      />
    </div>
    <ArkProgress.Track v-else class="progress__track">
      <ArkProgress.Range class="progress__indicator" />
    </ArkProgress.Track>
  </ArkProgress.Root>
</template>
