import { Component } from "@angular/core";
import { UioDateTimeInput } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** See `DateInputFixture` for why `defaultValue` binds to `[value]`. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDateTimeInput],
  template: `
    <div
      uioDateTimeInput
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [name]="p['name']"
      [min]="p['min']"
      [max]="p['max']"
      [step]="p['step']"
      [value]="p['defaultValue'] ?? ''"
    ></div>
  `,
})
export class DateTimeInputFixture {
  protected readonly p = parityProps();
}
