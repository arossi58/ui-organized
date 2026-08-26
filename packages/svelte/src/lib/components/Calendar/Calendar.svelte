<!--
  The design-system calendar grid, shared by the date fields' popover.

  Internal: it is not exported from the package barrel and has no parity case,
  because it has no public DOM contract of its own — every pixel of it reaches a
  user through DateInput, DateTimeInput or DateRangeInput.
-->
<script lang="ts">
  import { tick } from "svelte";
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
  import Button from "../Button/Button.svelte";
  import Select from "../Select/Select.svelte";
  import type { CalendarProps } from "./Calendar.types.js";
  import "@ui-organized/core/components/Calendar/Calendar.css";

  let {
    mode,
    value = null,
    rangeValue,
    min = null,
    max = null,
    numMonths = 1,
    weekStartsOn = 0,
    onSelect,
    onRangeChange,
    onRangeComplete,
    onActiveDay,
  }: CalendarProps = $props();

  const today = todayYMD();
  const start = $derived(rangeValue?.start ?? null);
  const end = $derived(rangeValue?.end ?? null);

  // Read once, at initialisation: this is where the calendar *opens*, not where
  // it stays. Making it reactive would drag the view back to the selected month
  // every time the value changed under a user who had paged away — so the
  // one-shot read the compiler warns about is the whole point.
  // svelte-ignore state_referenced_locally
  const initialAnchor =
    (mode === "single" ? value : (rangeValue?.start ?? null)) ?? clampYMD(today, min, max);

  let viewMonth = $state<YMD>(startOfMonth(initialAnchor));
  let focused = $state<YMD>(initialAnchor);
  let hover = $state<YMD | null>(null);
  // Portal the year Select's popup into the calendar's own subtree so option
  // clicks aren't seen as an outside-interaction that dismisses the enclosing
  // date popover (and so the popup inherits any theme scoped to that subtree).
  let rootEl = $state<HTMLDivElement | null>(null);

  // Roving focus: only move DOM focus when navigation came from the keyboard,
  // never on hover/render, so opening the popup doesn't yank focus around.
  // React needs an effect plus a "was this the keyboard?" flag, because its
  // `setFocused` is shared with the click and focus handlers; awaiting the
  // update inside `moveFocus` — the only keyboard path — says the same thing
  // without the extra state.
  const dayRefs = new Map<string, HTMLButtonElement>();

  /**
   * Registers a day button so keyboard navigation can focus it, and reports the
   * roving-focus one to the caller. React does both from a ref callback; an
   * action is the same hook — it runs after the node is in the DOM and again
   * whenever the parameters change.
   */
  function dayRef(node: HTMLButtonElement, params: { iso: string; active: boolean }) {
    dayRefs.set(params.iso, node);
    if (params.active) onActiveDay?.(node);
    return {
      update(next: { iso: string; active: boolean }) {
        if (next.iso !== params.iso) {
          dayRefs.delete(params.iso);
          dayRefs.set(next.iso, node);
        }
        params = next;
        if (next.active) onActiveDay?.(node);
      },
      destroy() {
        dayRefs.delete(params.iso);
      },
    };
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
    const lastVisible = addMonths(viewMonth, numMonths - 1);
    if (compareYMD(d, viewMonth) < 0) {
      viewMonth = startOfMonth(d);
    } else if (compareYMD(d, { ...lastVisible, day: 31 }) > 0) {
      viewMonth = startOfMonth(addMonths(d, -(numMonths - 1)));
    }
  }

  async function moveFocus(next: YMD) {
    focused = next;
    // A keyed month can page here, remounting every button, so the node has to
    // be looked up after the DOM has caught up rather than before.
    ensureVisible(next);
    await tick();
    dayRefs.get(toISODate(next))?.focus();
  }

  function selectDay(day: YMD) {
    if (!isWithin(day, min, max)) return;
    if (mode === "single") {
      onSelect?.(day);
      return;
    }
    if (!start || (start && end) || compareYMD(day, start) < 0) {
      onRangeChange?.({ start: day, end: null });
    } else {
      onRangeChange?.({ start, end: day });
      onRangeComplete?.();
    }
  }

  function onGridKeyDown(event: KeyboardEvent) {
    const weekday = (ymdToDate(focused).getDay() - weekStartsOn + 7) % 7;
    let next: YMD | null = null;
    switch (event.key) {
      case "ArrowLeft": next = addDays(focused, -1); break;
      case "ArrowRight": next = addDays(focused, 1); break;
      case "ArrowUp": next = addDays(focused, -7); break;
      case "ArrowDown": next = addDays(focused, 7); break;
      case "Home": next = addDays(focused, -weekday); break;
      case "End": next = addDays(focused, 6 - weekday); break;
      case "PageUp": next = addMonths(focused, -1); break;
      case "PageDown": next = addMonths(focused, 1); break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectDay(focused);
        return;
      default:
        return;
    }
    if (next) {
      event.preventDefault();
      moveFocus(clampYMD(next, min, max));
    }
  }

  // Resolve the active range endpoints (committed range, or start↔hover preview)
  // into ordered lo/hi so the in-range band renders the same either way.
  const band = $derived.by((): { lo: YMD | null; hi: YMD | null } => {
    if (mode !== "range" || !start) return { lo: null, hi: null };
    const other = end ?? hover;
    if (!other) return { lo: null, hi: null };
    const [lo, hi] = orderedPair(start, other);
    return { lo, hi };
  });

  const weekdays = $derived(weekdayLabels(weekStartsOn));
  const months = $derived(
    Array.from({ length: numMonths }, (_, i) => addMonths(viewMonth, i)),
  );
  const lastVisible = $derived(addMonths(viewMonth, numMonths - 1));

  // Can't page earlier than the month containing `min`, nor later than `max`.
  const prevDisabled = $derived(min ? compareYMD(viewMonth, startOfMonth(min)) <= 0 : false);
  const nextDisabled = $derived(
    max ? compareYMD(startOfMonth(lastVisible), startOfMonth(max)) >= 0 : false,
  );

  // Year dropdown options: bounded by min/max when set, else a wide default
  // window, always widened to include every visible year.
  const years = $derived.by(() => {
    const baseYear = today.year;
    const loYear = Math.min(min ? min.year : baseYear - 100, viewMonth.year);
    const hiYear = Math.max(max ? max.year : baseYear + 10, lastVisible.year);
    const out: number[] = [];
    for (let y = loYear; y <= hiYear; y++) out.push(y);
    return out;
  });
  const yearOptions = $derived(years.map((y) => ({ value: String(y), label: String(y) })));

  function handleYearChange(monthIndex: number, newYear: number) {
    const targetMonth = addMonths(viewMonth, monthIndex).month;
    const newView = addMonths({ year: newYear, month: targetMonth, day: 1 }, -monthIndex);
    viewMonth = newView;
    focused = clampYMD(startOfMonth(newView), min, max);
  }
</script>

{#snippet renderMonth(monthAnchor: YMD)}
  <div class="calendar__month">
    <div class="calendar__weekdays" aria-hidden="true">
      {#each weekdays as w, i (i)}
        <span class="calendar__weekday text-default-body-small">{w}</span>
      {/each}
    </div>
    <!--
      Weeks are real rows. A grid may only own rows, and a gridcell may only sit
      in one — a flat run of 42 day buttons under role="grid" is neither.
      `monthGrid` always returns six whole weeks, so the chunking is exact.
    -->
    <!--
      The grid itself is not a tab stop: focus lives on the day buttons, one of
      which always carries tabindex=0 (roving focus). A tabindex here would add a
      second stop that lands on nothing.
    -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="calendar__grid"
      role="grid"
      aria-label={monthLabel(monthAnchor.year, monthAnchor.month)}
      onkeydown={onGridKeyDown}
    >
      {#each weeksOf(monthGrid(monthAnchor.year, monthAnchor.month, weekStartsOn)) as week (toISODate(week[0]!))}
        <div class="calendar__week" role="row">
          {#each week as d (toISODate(d))}
            {@const iso = toISODate(d)}
            {@const isSingleSel = mode === "single" && isSameYMD(d, value ?? null)}
            {@const isLo = !!band.lo && isSameYMD(d, band.lo)}
            {@const isHi = !!band.hi && isSameYMD(d, band.hi)}
            {@const isEndpoint =
              mode === "range" && (isSameYMD(d, start) || isSameYMD(d, end) || isLo || isHi)}
            {@const selected = isSingleSel || isEndpoint}
            <button
              type="button"
              class="calendar__day"
              role="gridcell"
              use:dayRef={{ iso, active: isSameYMD(d, focused) }}
              tabindex={isSameYMD(d, focused) ? 0 : -1}
              disabled={!isWithin(d, min, max)}
              aria-label={ymdToDate(d).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              aria-selected={selected || undefined}
              aria-current={isSameYMD(d, today) ? "date" : undefined}
              data-outside={!isSameMonth(d, monthAnchor) || undefined}
              data-today={isSameYMD(d, today) || undefined}
              data-selected={selected || undefined}
              data-range-lo={(isLo && band.hi && !isSameYMD(band.lo, band.hi)) || undefined}
              data-range-hi={(isHi && band.lo && !isSameYMD(band.lo, band.hi)) || undefined}
              data-in-range={(!!band.lo &&
                !!band.hi &&
                compareYMD(d, band.lo) > 0 &&
                compareYMD(d, band.hi) < 0) ||
                undefined}
              onclick={() => {
                focused = d;
                selectDay(d);
              }}
              onmouseenter={() => {
                if (mode === "range" && start && !end) hover = d;
              }}
              onfocus={() => (focused = d)}
            >
              <span class="calendar__day-label text-default-body-large">{d.day}</span>
            </button>
          {/each}
        </div>
      {/each}
    </div>
  </div>
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="calendar" bind:this={rootEl} onmouseleave={() => (hover = null)}>
  <div class="calendar__header">
    <Button
      intent="ghost"
      size="sm"
      icon="chevron-left"
      class="calendar__nav"
      onclick={() => (viewMonth = addMonths(viewMonth, -1))}
      disabled={prevDisabled}
      aria-label="Previous month"
    />
    <div class="calendar__labels">
      {#each months as m, i (`${m.year}-${m.month}`)}
        <div class="calendar__label">
          <span class="calendar__month-name text-emphasis-body-large">
            {monthName(m.year, m.month)}
          </span>
          <Select
            variant="ghost"
            size="sm"
            label={`Year, ${monthName(m.year, m.month)}`}
            options={yearOptions}
            value={String(m.year)}
            onValueChange={(v) => handleYearChange(i, Number(v))}
            portalContainer={rootEl}
          />
        </div>
      {/each}
    </div>
    <Button
      intent="ghost"
      size="sm"
      icon="chevron-right"
      class="calendar__nav"
      onclick={() => (viewMonth = addMonths(viewMonth, 1))}
      disabled={nextDisabled}
      aria-label="Next month"
    />
  </div>
  <div class="calendar__months">
    {#each months as m (`${m.year}-${m.month}`)}
      {@render renderMonth(m)}
    {/each}
  </div>
</div>
