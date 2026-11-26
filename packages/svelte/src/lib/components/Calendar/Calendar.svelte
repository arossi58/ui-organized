<script lang="ts">
  import { clsx } from "clsx";
  import { calendarPanelStyles, parseISODate, toISODate, type YMD } from "@ui-organized/core";
  import CalendarGrid from "./CalendarGrid.svelte";
  import CalendarPresets from "./CalendarPresets.svelte";
  import type { CalendarProps } from "./Calendar.types.js";
  import type { DateRangeValue } from "../DateRangeInput/DateRangeInput.types.js";
  import "@ui-organized/core/components/Calendar/Calendar.css";

  // A month grid on its own: in a page, a card or a panel of your own. Values
  // are ISO `YYYY-MM-DD` strings, as on DateInput and DateRangeInput.
  let {
    mode = "single",
    value = $bindable(),
    defaultValue,
    onValueChange,
    onRangeComplete,
    min,
    max,
    numMonths = 1,
    weekStartsOn = 0,
    presets,
    presetsLabel,
    variant,
    footer,
    class: className,
  }: CalendarProps = $props();

  const range = $derived(mode === "range");
  const emptyRange: DateRangeValue = { start: "", end: "" };
  // Uncontrolled until bound or passed; the default is read once, by design.
  // svelte-ignore state_referenced_locally
  let inner = $state<string | DateRangeValue | undefined>(defaultValue);
  const current = $derived(value !== undefined ? value : (inner ?? (range ? emptyRange : "")));
  // A preset moves the view to its month; the grid keeps its view as state, so
  // it is handed a new key rather than told.
  let viewKey = $state(0);
  let latest: DateRangeValue = emptyRange;

  const iso = (d: YMD | null) => (d ? toISODate(d) : "");
  const selected = $derived(
    range
      ? { start: parseISODate((current as DateRangeValue).start), end: parseISODate((current as DateRangeValue).end) }
      : { start: parseISODate(current as string), end: parseISODate(current as string) },
  );

  function commit(next: string | DateRangeValue) {
    inner = next;
    value = next;
    onValueChange?.(next);
  }

  function pick(r: { start: YMD; end: YMD }) {
    if (range) {
      const next = { start: toISODate(r.start), end: toISODate(r.end) };
      commit(next);
      onRangeComplete?.(next);
    } else {
      commit(toISODate(r.start));
    }
    viewKey += 1;
  }
</script>

<div class={clsx(calendarPanelStyles({ variant }), className)}>
  {#if presets && presets.length > 0}
    <CalendarPresets {presets} {selected} {min} {max} {weekStartsOn} label={presetsLabel} onPick={pick} />
  {/if}
  <div class="calendar-panel__body">
    {#key viewKey}
      {#if range}
        <CalendarGrid
          mode="range"
          rangeValue={{ start: selected.start, end: selected.end }}
          min={parseISODate(min)}
          max={parseISODate(max)}
          {numMonths}
          {weekStartsOn}
          onRangeChange={(r) => {
            latest = { start: iso(r.start), end: iso(r.end) };
            commit(latest);
          }}
          onRangeComplete={() => onRangeComplete?.(latest)}
        />
      {:else}
        <CalendarGrid
          mode="single"
          value={selected.start}
          min={parseISODate(min)}
          max={parseISODate(max)}
          {numMonths}
          {weekStartsOn}
          onSelect={(d) => commit(toISODate(d))}
        />
      {/if}
    {/key}
    {#if footer}<div class="calendar-panel__footer">{@render footer()}</div>{/if}
  </div>
</div>
