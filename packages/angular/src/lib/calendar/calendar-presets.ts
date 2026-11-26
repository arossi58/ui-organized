import { Component, computed, input, output } from "@angular/core";
import {
  isSameYMD,
  parseISODate,
  presetWithin,
  resolveDatePreset,
  todayYMD,
  type DatePresetValue,
  type YMD,
  type YMDRange,
} from "@ui-organized/core";

/** A shortcut beside the grid: "Today", "Last 7 days", a fixed date or range. */
export interface DatePreset {
  label: string;
  /**
   * An ISO date, an ISO range, or a name resolved against today (`today`,
   * `yesterday`, `last7Days`, `thisMonth`, `lastQuarter`, …). A preset outside
   * `min`/`max` is disabled.
   */
  value: DatePresetValue;
  disabled?: boolean;
}

/**
 * The column of shortcuts beside a grid, shared by UioCalendar and
 * UioDateRangeInput. Each is a toggle button, pressed while the selection is
 * exactly the range it stands for. Internal: the element it sits on is the
 * column itself, so the DOM matches the other three libraries.
 */
@Component({
  selector: "div[uioCalendarPresets]",
  standalone: true,
  template: `
    @for (item of resolved(); track item.preset.label) {
      <button
        type="button"
        class="calendar-panel__preset"
        [attr.aria-pressed]="item.pressed ? 'true' : 'false'"
        [disabled]="item.preset.disabled || !item.usable"
        (click)="item.range && pick.emit(item.range)"
      >{{ item.preset.label }}</button>
    }
  `,
  host: {
    class: "calendar-panel__presets",
    role: "group",
    "[attr.aria-label]": "label() ?? 'Presets'",
  },
})
export class UioCalendarPresets {
  readonly presets = input<readonly DatePreset[]>([]);
  readonly selected = input<{ start: YMD | null; end: YMD | null }>({ start: null, end: null });
  readonly min = input<string | undefined>(undefined);
  readonly max = input<string | undefined>(undefined);
  readonly weekStartsOn = input(0);
  readonly label = input<string | undefined>(undefined);
  readonly pick = output<YMDRange>();

  private readonly today = todayYMD();
  protected readonly resolved = computed(() => {
    const selected = this.selected();
    const lo = parseISODate(this.min());
    const hi = parseISODate(this.max());
    return this.presets().map((preset) => {
      const range = resolveDatePreset(preset.value, this.today, this.weekStartsOn());
      const usable = !!range && presetWithin(range, lo, hi);
      const pressed = !!range && isSameYMD(range.start, selected.start) && isSameYMD(range.end, selected.end);
      return { preset, range, usable, pressed };
    });
  });
}
