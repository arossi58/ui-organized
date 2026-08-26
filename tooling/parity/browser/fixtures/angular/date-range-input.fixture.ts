import { Component } from "@angular/core";
import { UioDateRangeInput, type DateRangeValue } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultValue` binds to `[value]` — see `DateInputFixture`. It is read into a
 * field rather than written as an object literal in the template: a literal is a
 * new object every change-detection pass, which would re-set the model and undo
 * whatever the calendar had just written into it.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDateRangeInput],
  template: `
    <div
      uioDateRangeInput
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [min]="p['min']"
      [max]="p['max']"
      [startName]="p['startName']"
      [endName]="p['endName']"
      [value]="initial"
    ></div>
  `,
})
export class DateRangeInputFixture {
  protected readonly p = parityProps();
  protected readonly initial = (this.p["defaultValue"] ?? { start: "", end: "" }) as DateRangeValue;
}
