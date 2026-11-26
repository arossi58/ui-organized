<script setup lang="ts">
import { computed } from "vue";
import {
  isSameYMD,
  parseISODate,
  presetWithin,
  resolveDatePreset,
  todayYMD,
  type YMD,
  type YMDRange,
} from "@ui-organized/core";
import type { DatePreset } from "./Calendar.types.js";

// The column of shortcuts beside a grid, shared by Calendar and
// DateRangeInput. Each is a toggle button, pressed while the selection is
// exactly the range it stands for.
const props = withDefaults(
  defineProps<{
    presets: DatePreset[];
    selected: { start: YMD | null; end: YMD | null };
    min?: string;
    max?: string;
    weekStartsOn?: number;
    label?: string;
  }>(),
  { weekStartsOn: 0 },
);
const emit = defineEmits<{ pick: [range: YMDRange] }>();
const today = todayYMD();
const resolved = computed(() =>
  props.presets.map((preset) => {
    const range = resolveDatePreset(preset.value, today, props.weekStartsOn);
    const usable = !!range && presetWithin(range, parseISODate(props.min), parseISODate(props.max));
    const pressed =
      !!range && isSameYMD(range.start, props.selected.start) && isSameYMD(range.end, props.selected.end);
    return { preset, range, usable, pressed };
  }),
);
</script>

<template>
  <div class="calendar-panel__presets" role="group" :aria-label="label ?? 'Presets'">
    <button
      v-for="item in resolved"
      :key="item.preset.label"
      type="button"
      class="calendar-panel__preset"
      :aria-pressed="item.pressed"
      :disabled="item.preset.disabled || !item.usable"
      @click="item.range && emit('pick', item.range)"
    >
      {{ item.preset.label }}
    </button>
  </div>
</template>
