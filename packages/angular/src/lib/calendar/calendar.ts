import { ApplicationRef, Component, Directive, computed, inject, input, model, output, signal } from "@angular/core";
import { calendarPanelStyles, parseISODate, toISODate, type CalendarPanelVariants, type YMD, type YMDRange } from "@ui-organized/core";
import { UioCalendarGrid, type CalendarRange } from "./calendar-grid.js";
import { UioCalendarPresets, type DatePreset } from "./calendar-presets.js";
import type { DateRangeValue } from "../date-range-input/date-range-input.js";
import { flushNow } from "../overlay/flush.js";

export type CalendarVariant = NonNullable<CalendarPanelVariants["variant"]>;

/** A row under the grid, for actions such as Cancel and Apply. The element is the row. */
@Directive({
  selector: "[uioCalendarFooter]",
  standalone: true,
  host: { class: "calendar-panel__footer" },
})
export class UioCalendarFooter {}

/**
 * A month grid on its own: in a page, a card or a panel of your own. Values
 * are ISO `YYYY-MM-DD` strings, as on UioDateInput and UioDateRangeInput.
 *
 * ```html
 * <div uioCalendar [(value)]="day"></div>
 * <div uioCalendar mode="range" [(range)]="stay" [presets]="presets" variant="card">
 *   <div uioCalendarFooter><button uioButton intent="secondary">Cancel</button></div>
 * </div>
 * ```
 *
 * Single and range values are separate models rather than one union, because
 * a union would break `[(value)]` under strict templates.
 */
@Component({
  selector: "div[uioCalendar]",
  standalone: true,
  imports: [UioCalendarGrid, UioCalendarPresets],
  template: `
    @if (presets().length) {
      <div
        uioCalendarPresets
        [presets]="presets()"
        [selected]="selected()"
        [min]="min()"
        [max]="max()"
        [weekStartsOn]="weekStartsOn()"
        [label]="presetsLabel()"
        (pick)="pick($event)"
      ></div>
    }
    <div class="calendar-panel__body">
      <!--
        A preset moves the view to its month. The grid keeps its view as state,
        so a one-item @for keyed on a counter remounts it rather than tells it.
      -->
      @for (key of viewKeys(); track key) {
        <div
          uioCalendarGrid
          [mode]="mode()"
          [value]="mode() === 'single' ? selected().start : null"
          [rangeValue]="mode() === 'range' ? selected() : null"
          [min]="minDay()"
          [max]="maxDay()"
          [numMonths]="numMonths()"
          [weekStartsOn]="weekStartsOn()"
          (daySelect)="onDay($event)"
          (rangeChange)="onRange($event)"
          (rangeComplete)="rangeComplete.emit(range())"
        ></div>
      }
      <ng-content select="[uioCalendarFooter]" />
    </div>
  `,
  host: { "[class]": "hostClass()" },
})
export class UioCalendar {
  /** `single` (the default) picks one day; `range` a start and an end. */
  readonly mode = input<"single" | "range">("single");
  /** Single mode: the chosen day, ISO `YYYY-MM-DD` (`""` when empty). */
  readonly value = model("");
  /** Range mode: the chosen range. */
  readonly range = model<DateRangeValue>({ start: "", end: "" });
  readonly min = input<string | undefined>(undefined);
  readonly max = input<string | undefined>(undefined);
  /** Months shown side by side. */
  readonly numMonths = input(1);
  /** First day of the week: 0 = Sunday, 1 = Monday. */
  readonly weekStartsOn = input(0);
  /** Shortcuts in a column before the grid. */
  readonly presets = input<readonly DatePreset[]>([]);
  /** The presets column's accessible name. Defaults to "Presets". */
  readonly presetsLabel = input<string | undefined>(undefined);
  /** `card` puts the calendar on a bordered surface. */
  readonly variant = input<CalendarVariant>("plain");
  /** Range mode: both ends are chosen, by picking or by a preset. */
  readonly rangeComplete = output<DateRangeValue>();

  private readonly appRef = inject(ApplicationRef);
  private readonly viewKey = signal(0);
  protected readonly viewKeys = computed(() => [this.viewKey()]);
  protected readonly minDay = computed(() => parseISODate(this.min()));
  protected readonly maxDay = computed(() => parseISODate(this.max()));
  protected readonly hostClass = computed(() => calendarPanelStyles({ variant: this.variant() }));
  protected readonly selected = computed<CalendarRange>(() => {
    if (this.mode() === "range") {
      const r = this.range();
      return { start: parseISODate(r.start), end: parseISODate(r.end) };
    }
    const day = parseISODate(this.value());
    return { start: day, end: day };
  });

  protected onDay(day: YMD): void {
    this.value.set(toISODate(day));
    flushNow(this.appRef);
  }

  protected onRange(r: CalendarRange): void {
    this.range.set({ start: r.start ? toISODate(r.start) : "", end: r.end ? toISODate(r.end) : "" });
    flushNow(this.appRef);
  }

  protected pick(r: YMDRange): void {
    if (this.mode() === "range") {
      const next = { start: toISODate(r.start), end: toISODate(r.end) };
      this.range.set(next);
      this.rangeComplete.emit(next);
    } else {
      this.value.set(toISODate(r.start));
    }
    this.viewKey.update((k) => k + 1);
    flushNow(this.appRef);
  }
}
