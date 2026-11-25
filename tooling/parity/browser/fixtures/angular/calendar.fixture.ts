import { Component } from "@angular/core";
import { UioButton, UioCalendar, UioCalendarFooter, type DateRangeValue, type DatePreset } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Single and range values are separate models on UioCalendar, so the scenario's
 * one `defaultValue` is routed by `mode`. Both are read into fields rather than
 * written as literals in the template, for the reason DateRangeInputFixture gives.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCalendar, UioCalendarFooter, UioButton],
  template: `
    <div
      uioCalendar
      [mode]="mode"
      [value]="single"
      [range]="range"
      [min]="p['min']"
      [max]="p['max']"
      [numMonths]="p['numMonths'] ?? 1"
      [presets]="presets"
      [variant]="p['variant'] ?? 'plain'"
    >
      @if (p['withFooter']) {
        <div uioCalendarFooter><button uioButton intent="primary" size="sm">Apply</button></div>
      }
    </div>
  `,
})
export class CalendarFixture {
  protected readonly p = parityProps();
  protected readonly mode = (this.p["mode"] ?? "single") as "single" | "range";
  protected readonly single = this.mode === "single" ? ((this.p["defaultValue"] as string) ?? "") : "";
  protected readonly range = (this.mode === "range" ? this.p["defaultValue"] : { start: "", end: "" }) as DateRangeValue;
  protected readonly presets = (this.p["presets"] ?? []) as DatePreset[];
}
