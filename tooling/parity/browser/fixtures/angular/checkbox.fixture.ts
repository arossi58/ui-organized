import { Component } from "@angular/core";
import { UioCheckbox } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultChecked` maps to `[checked]`, as it does for Switch: `model()` is
 * uncontrolled until something binds it, so a one-way `[checked]` is an initial
 * value the component still owns and the controlled/uncontrolled fork React
 * implements by hand does not arise.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCheckbox],
  template: `
    <label
      uioCheckbox
      [checked]="p['defaultChecked'] ?? p['checked'] ?? false"
      [indeterminate]="!!p['indeterminate']"
      [label]="p['label']"
      [disabled]="!!p['disabled']"
      [required]="!!p['required']"
      [name]="p['name']"
      [aria-label]="p['aria-label']"
    ></label>
  `,
})
export class CheckboxFixture {
  protected readonly p = parityProps();
}
