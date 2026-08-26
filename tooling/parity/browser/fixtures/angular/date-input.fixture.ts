import { Component } from "@angular/core";
import { UioDateInput } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultValue` in React is the uncontrolled initial value; a `model()` is
 * uncontrolled until something binds it, so `[value]` is both — the same fork
 * `UioSwitch` describes and `SelectFixture` already takes.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDateInput],
  template: `
    <div
      uioDateInput
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [name]="p['name']"
      [min]="p['min']"
      [max]="p['max']"
      [value]="p['defaultValue'] ?? ''"
    ></div>
  `,
})
export class DateInputFixture {
  protected readonly p = parityProps();
}
