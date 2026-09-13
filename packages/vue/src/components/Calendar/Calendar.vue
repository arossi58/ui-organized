<!--
  The design-system calendar grid, shared by the date fields' popover.

  Internal: it is not exported from the package barrel and has no parity case,
  because it has no public DOM contract of its own — every pixel of it reaches a
  user through DateInput, DateTimeInput or DateRangeInput.
-->
<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import {
  addDays,
  addMonths,
  clampYMD,
  compareYMD,
  isSameMonth,
  isSameYMD,
  isWithin,
  monthGrid,
  monthLabel,
  monthName,
  startOfMonth,
  todayYMD,
  toISODate,
  weekdayLabels,
  ymdToDate,
  type YMD,
} from "@ui-organized/core";
import Button from "../Button/Button.vue";
import Select from "../Select/Select.vue";
import type { CalendarProps, CalendarRange } from "./Calendar.types.js";
import "@ui-organized/core/components/Calendar/Calendar.css";

const props = withDefaults(defineProps<CalendarProps>(), {
  value: null,
  min: null,
  max: null,
  numMonths: 1,
  weekStartsOn: 0,
});

const today = todayYMD();
const start = computed(() => props.rangeValue?.start ?? null);
const end = computed(() => props.rangeValue?.end ?? null);

// Read once, at initialisation: this is where the calendar *opens*, not where it
// stays. Making it reactive would drag the view back to the selected month every
// time the value changed under a user who had paged away.
const initialAnchor =
  (props.mode === "single" ? props.value : (props.rangeValue?.start ?? null)) ??
  clampYMD(today, props.min, props.max);

const viewMonth = ref<YMD>(startOfMonth(initialAnchor));
const focused = ref<YMD>(initialAnchor);
const hover = ref<YMD | null>(null);
// Portal the year Select's popup into the calendar's own subtree so option
// clicks aren't seen as an outside-interaction that dismisses the enclosing date
// popover (and so the popup inherits any theme scoped to that subtree).
const rootEl = ref<HTMLDivElement | null>(null);

// Roving focus: only move DOM focus when navigation came from the keyboard,
// never on hover/render, so opening the popup doesn't yank focus around. React
// needs an effect plus a "was this the keyboard?" flag, because its `setFocused`
// is shared with the click and focus handlers; awaiting the update inside
// `moveFocus` — the only keyboard path — says the same thing without the state.
const dayRefs = new Map<string, HTMLButtonElement>();

function registerDay(iso: string, el: HTMLButtonElement | null, active: boolean) {
  if (el) dayRefs.set(iso, el);
  else dayRefs.delete(iso);
  if (active) props.onActiveDay?.(el);
}

function orderedPair(a: YMD, b: YMD): [YMD, YMD] {
  return compareYMD(a, b) <= 0 ? [a, b] : [b, a];
}

/** `monthGrid`'s flat run of days, split into the weeks it already represents. */
function weeksOf(cells: YMD[]): YMD[][] {
  const weeks: YMD[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function ensureVisible(d: YMD) {
  const lastVisibleMonth = addMonths(viewMonth.value, props.numMonths - 1);
  if (compareYMD(d, viewMonth.value) < 0) {
    viewMonth.value = startOfMonth(d);
  } else if (compareYMD(d, { ...lastVisibleMonth, day: 31 }) > 0) {
    viewMonth.value = startOfMonth(addMonths(d, -(props.numMonths - 1)));
  }
}

async function moveFocus(next: YMD) {
  focused.value = next;
  // Paging remounts every button, so the node has to be looked up after the DOM
  // has caught up rather than before.
  ensureVisible(next);
  await nextTick();
  dayRefs.get(toISODate(next))?.focus();
}

function selectDay(day: YMD) {
  if (!isWithin(day, props.min, props.max)) return;
  if (props.mode === "single") {
    props.onSelect?.(day);
    return;
  }
  if (!start.value || (start.value && end.value) || compareYMD(day, start.value) < 0) {
    props.onRangeChange?.({ start: day, end: null });
  } else {
    props.onRangeChange?.({ start: start.value, end: day });
    props.onRangeComplete?.();
  }
}

function onGridKeyDown(event: KeyboardEvent) {
  const weekday = (ymdToDate(focused.value).getDay() - props.weekStartsOn + 7) % 7;
  let next: YMD | null = null;
  switch (event.key) {
    case "ArrowLeft": next = addDays(focused.value, -1); break;
    case "ArrowRight": next = addDays(focused.value, 1); break;
    case "ArrowUp": next = addDays(focused.value, -7); break;
    case "ArrowDown": next = addDays(focused.value, 7); break;
    case "Home": next = addDays(focused.value, -weekday); break;
    case "End": next = addDays(focused.value, 6 - weekday); break;
    case "PageUp": next = addMonths(focused.value, -1); break;
    case "PageDown": next = addMonths(focused.value, 1); break;
    case "Enter":
    case " ":
      event.preventDefault();
      selectDay(focused.value);
      return;
    default:
      return;
  }
  if (next) {
    event.preventDefault();
    void moveFocus(clampYMD(next, props.min, props.max));
  }
}

// Resolve the active range endpoints (committed range, or start↔hover preview)
// into ordered lo/hi so the in-range band renders the same either way.
const band = computed<CalendarRange>(() => {
  if (props.mode !== "range" || !start.value) return { start: null, end: null };
  const other = end.value ?? hover.value;
  if (!other) return { start: null, end: null };
  const [lo, hi] = orderedPair(start.value, other);
  return { start: lo, end: hi };
});

const weekdays = computed(() => weekdayLabels(props.weekStartsOn));
const months = computed(() =>
  Array.from({ length: props.numMonths }, (_, i) => addMonths(viewMonth.value, i)),
);
const lastVisible = computed(() => addMonths(viewMonth.value, props.numMonths - 1));

// Can't page earlier than the month containing `min`, nor later than `max`.
const prevDisabled = computed(() =>
  props.min ? compareYMD(viewMonth.value, startOfMonth(props.min)) <= 0 : false,
);
const nextDisabled = computed(() =>
  props.max
    ? compareYMD(startOfMonth(lastVisible.value), startOfMonth(props.max)) >= 0
    : false,
);

// Year dropdown options: bounded by min/max when set, else a wide default
// window, always widened to include every visible year.
const yearOptions = computed(() => {
  const baseYear = today.year;
  const loYear = Math.min(props.min ? props.min.year : baseYear - 100, viewMonth.value.year);
  const hiYear = Math.max(props.max ? props.max.year : baseYear + 10, lastVisible.value.year);
  const out: { value: string; label: string }[] = [];
  for (let y = loYear; y <= hiYear; y++) out.push({ value: String(y), label: String(y) });
  return out;
});

function handleYearChange(monthIndex: number, newYear: number) {
  const targetMonth = addMonths(viewMonth.value, monthIndex).month;
  const newView = addMonths({ year: newYear, month: targetMonth, day: 1 }, -monthIndex);
  viewMonth.value = newView;
  focused.value = clampYMD(startOfMonth(newView), props.min, props.max);
}

/**
 * Every visible month, resolved down to what the template renders.
 *
 * Built here rather than called from the template: a Vue template has no
 * `{@const}`, so a `dayState(d)` helper would be re-invoked once per binding —
 * nine times for each of 252 cells on a two-month range calendar, on every
 * hover. Resolving each cell once and letting the computed cache it is the same
 * markup at a fraction of the work.
 */
function dayCell(d: YMD, monthAnchor: YMD) {
  const lo = band.value.start;
  const hi = band.value.end;
  const isSingleSel = props.mode === "single" && isSameYMD(d, props.value ?? null);
  const isLo = !!lo && isSameYMD(d, lo);
  const isHi = !!hi && isSameYMD(d, hi);
  const isEndpoint =
    props.mode === "range" &&
    (isSameYMD(d, start.value) || isSameYMD(d, end.value) || isLo || isHi);
  const selected = isSingleSel || isEndpoint;
  // A one-day range has no band, so neither end draws a half-rounded edge.
  const spans = !!lo && !!hi && !isSameYMD(lo, hi);
  return {
    day: d,
    iso: toISODate(d),
    label: ymdToDate(d).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    selected: selected || undefined,
    focused: isSameYMD(d, focused.value),
    disabled: !isWithin(d, props.min, props.max),
    outside: !isSameMonth(d, monthAnchor) || undefined,
    isToday: isSameYMD(d, today) || undefined,
    rangeLo: (isLo && spans) || undefined,
    rangeHi: (isHi && spans) || undefined,
    inRange:
      (!!lo && !!hi && compareYMD(d, lo) > 0 && compareYMD(d, hi) < 0) || undefined,
  };
}

const monthViews = computed(() =>
  months.value.map((monthAnchor) => ({
    key: `${monthAnchor.year}-${monthAnchor.month}`,
    gridLabel: monthLabel(monthAnchor.year, monthAnchor.month),
    weeks: weeksOf(
      monthGrid(monthAnchor.year, monthAnchor.month, props.weekStartsOn),
    ).map((week) => ({ key: toISODate(week[0]!), days: week.map((d) => dayCell(d, monthAnchor)) })),
  })),
);
</script>

<template>
  <div ref="rootEl" class="calendar" @mouseleave="hover = null">
    <div class="calendar__header">
      <Button
        intent="ghost"
        size="sm"
        icon="chevron-left"
        class="calendar__nav"
        :disabled="prevDisabled"
        aria-label="Previous month"
        @click="viewMonth = addMonths(viewMonth, -1)"
      />
      <div class="calendar__labels">
        <div v-for="(m, i) in months" :key="`${m.year}-${m.month}`" class="calendar__label">
          <span class="calendar__month-name text-emphasis-body-large">
            {{ monthName(m.year, m.month) }}
          </span>
          <Select
            variant="ghost"
            size="sm"
            :label="`Year, ${monthName(m.year, m.month)}`"
            :options="yearOptions"
            :model-value="String(m.year)"
            :portal-container="rootEl"
            @value-change="(v: string) => handleYearChange(i, Number(v))"
          />
        </div>
      </div>
      <Button
        intent="ghost"
        size="sm"
        icon="chevron-right"
        class="calendar__nav"
        :disabled="nextDisabled"
        aria-label="Next month"
        @click="viewMonth = addMonths(viewMonth, 1)"
      />
    </div>
    <div class="calendar__months">
      <div v-for="month in monthViews" :key="month.key" class="calendar__month">
        <div class="calendar__weekdays" aria-hidden="true">
          <span
            v-for="(w, i) in weekdays"
            :key="i"
            class="calendar__weekday text-default-body-small"
          >
            {{ w }}
          </span>
        </div>
        <!--
          Weeks are real rows. A grid may only own rows, and a gridcell may only
          sit in one — a flat run of 42 day buttons under role="grid" is neither.
          `monthGrid` always returns six whole weeks, so the chunking is exact.

          The grid itself is not a tab stop: focus lives on the day buttons, one
          of which always carries tabindex=0 (roving focus).
        -->
        <div
          class="calendar__grid"
          role="grid"
          :aria-label="month.gridLabel"
          @keydown="onGridKeyDown"
        >
          <div v-for="week in month.weeks" :key="week.key" class="calendar__week" role="row">
            <button
              v-for="cell in week.days"
              :key="cell.iso"
              :ref="(el) => registerDay(cell.iso, el as HTMLButtonElement | null, cell.focused)"
              type="button"
              class="calendar__day"
              role="gridcell"
              :tabindex="cell.focused ? 0 : -1"
              :disabled="cell.disabled"
              :aria-label="cell.label"
              :aria-selected="cell.selected"
              :aria-current="cell.isToday ? 'date' : undefined"
              :data-outside="cell.outside"
              :data-today="cell.isToday"
              :data-selected="cell.selected"
              :data-range-lo="cell.rangeLo"
              :data-range-hi="cell.rangeHi"
              :data-in-range="cell.inRange"
              @click="
                () => {
                  focused = cell.day;
                  selectDay(cell.day);
                }
              "
              @mouseenter="
                () => {
                  if (mode === 'range' && start && !end) hover = cell.day;
                }
              "
              @focus="focused = cell.day"
            >
              <span class="calendar__day-label text-default-body-large">{{ cell.day.day }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
