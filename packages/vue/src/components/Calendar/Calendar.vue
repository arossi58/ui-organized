<script setup lang="ts">
import { computed, ref, useAttrs, useSlots } from "vue";
import { clsx } from "clsx";
import { calendarPanelStyles, parseISODate, toISODate, type YMD, type YMDRange } from "@ui-organized/core";
import CalendarGrid from "./CalendarGrid.vue";
import CalendarPresets from "./CalendarPresets.vue";
import type { CalendarProps } from "./Calendar.types.js";
import type { DateRangeValue } from "../DateRangeInput/DateRangeInput.types.js";
import "@ui-organized/core/components/Calendar/Calendar.css";

// A month grid on its own: in a page, a card or a panel of your own. Values are
// ISO `YYYY-MM-DD` strings, as on DateInput and DateRangeInput.
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<CalendarProps>(), { mode: "single", numMonths: 1, weekStartsOn: 0 });
const emit = defineEmits<{
  "update:modelValue": [value: string | DateRangeValue];
  valueChange: [value: string | DateRangeValue];
  rangeComplete: [value: DateRangeValue];
}>();
defineSlots<{ footer?: () => unknown }>();
const attrs = useAttrs();
const slots = useSlots();

const EMPTY: DateRangeValue = { start: "", end: "" };
const range = computed(() => props.mode === "range");
const inner = ref<string | DateRangeValue | undefined>(props.defaultValue);
const current = computed(() => props.modelValue ?? inner.value ?? (range.value ? EMPTY : ""));
// A preset moves the view to its month; the grid keeps its view as state, so
// it is handed a new key rather than told.
const viewKey = ref(0);
let latest: DateRangeValue = EMPTY;

const iso = (d: YMD | null) => (d ? toISODate(d) : "");
const selected = computed(() => {
  if (range.value) {
    const r = current.value as DateRangeValue;
    return { start: parseISODate(r.start), end: parseISODate(r.end) };
  }
  const day = parseISODate(current.value as string);
  return { start: day, end: day };
});
const rootClass = computed(() => clsx(calendarPanelStyles({ variant: props.variant }), attrs.class as string));

function commit(next: string | DateRangeValue) {
  inner.value = next;
  emit("update:modelValue", next);
  emit("valueChange", next);
}
function onRangeChange(r: { start: YMD | null; end: YMD | null }) {
  latest = { start: iso(r.start), end: iso(r.end) };
  commit(latest);
}
function pick(r: YMDRange) {
  if (range.value) {
    const next = { start: toISODate(r.start), end: toISODate(r.end) };
    commit(next);
    emit("rangeComplete", next);
  } else {
    commit(toISODate(r.start));
  }
  viewKey.value += 1;
}
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <CalendarPresets
      v-if="presets && presets.length > 0"
      :presets="presets"
      :selected="selected"
      :min="min"
      :max="max"
      :week-starts-on="weekStartsOn"
      :label="presetsLabel"
      @pick="pick"
    />
    <div class="calendar-panel__body">
      <CalendarGrid
        v-if="range"
        :key="`range-${viewKey}`"
        mode="range"
        :range-value="{ start: selected.start, end: selected.end }"
        :min="parseISODate(min)"
        :max="parseISODate(max)"
        :num-months="numMonths"
        :week-starts-on="weekStartsOn"
        :on-range-change="onRangeChange"
        :on-range-complete="() => emit('rangeComplete', latest)"
      />
      <CalendarGrid
        v-else
        :key="`single-${viewKey}`"
        mode="single"
        :value="selected.start"
        :min="parseISODate(min)"
        :max="parseISODate(max)"
        :num-months="numMonths"
        :week-starts-on="weekStartsOn"
        :on-select="(d: YMD) => commit(toISODate(d))"
      />
      <div v-if="slots.footer" class="calendar-panel__footer"><slot name="footer" /></div>
    </div>
  </div>
</template>
