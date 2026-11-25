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

interface CalendarPresetsProps {
  presets: DatePreset[];
  /** The current selection, resolved to a range (a single day is start = end). */
  selected: { start: YMD | null; end: YMD | null };
  min: string | undefined;
  max: string | undefined;
  weekStartsOn: number;
  label?: string;
  onPick: (range: YMDRange) => void;
}

/**
 * The column of shortcuts beside a grid, shared by Calendar and
 * DateRangeInput. Each is a toggle button, pressed while the selection is
 * exactly the range it stands for.
 */
export function CalendarPresets({ presets, selected, min, max, weekStartsOn, label, onPick }: CalendarPresetsProps) {
  const today = todayYMD();
  const lo = parseISODate(min);
  const hi = parseISODate(max);
  return (
    <div className="calendar-panel__presets" role="group" aria-label={label ?? "Presets"}>
      {presets.map((preset) => {
        const range = resolveDatePreset(preset.value, today, weekStartsOn);
        const usable = !!range && presetWithin(range, lo, hi);
        const pressed = !!range && isSameYMD(range.start, selected.start) && isSameYMD(range.end, selected.end);
        return (
          <button
            key={preset.label}
            type="button"
            className="calendar-panel__preset"
            aria-pressed={pressed}
            disabled={preset.disabled || !usable}
            onClick={() => range && onPick(range)}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
