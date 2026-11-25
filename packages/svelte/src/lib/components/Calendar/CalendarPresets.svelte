<script lang="ts">
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
  let {
    presets,
    selected,
    min,
    max,
    weekStartsOn = 0,
    label,
    onPick,
  }: {
    presets: DatePreset[];
    selected: { start: YMD | null; end: YMD | null };
    min?: string;
    max?: string;
    weekStartsOn?: number;
    label?: string;
    onPick: (range: YMDRange) => void;
  } = $props();

  const today = todayYMD();
  const resolved = $derived(
    presets.map((preset) => {
      const range = resolveDatePreset(preset.value, today, weekStartsOn);
      const usable = !!range && presetWithin(range, parseISODate(min), parseISODate(max));
      const pressed = !!range && isSameYMD(range.start, selected.start) && isSameYMD(range.end, selected.end);
      return { preset, range, usable, pressed };
    }),
  );
</script>

<div class="calendar-panel__presets" role="group" aria-label={label ?? "Presets"}>
  {#each resolved as item (item.preset.label)}
    <button
      type="button"
      class="calendar-panel__preset"
      aria-pressed={item.pressed}
      disabled={item.preset.disabled || !item.usable}
      onclick={() => item.range && onPick(item.range)}
    >
      {item.preset.label}
    </button>
  {/each}
</div>
