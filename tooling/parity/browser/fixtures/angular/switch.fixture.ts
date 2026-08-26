import { Component } from "@angular/core";
import { UioSwitch } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultChecked` maps to `[checked]`. Angular has no controlled/uncontrolled
 * fork to express: `model()` is uncontrolled until something binds it, so a
 * one-way `[checked]` is an initial value that the component still owns.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSwitch],
  template: `
    <label
      uioSwitch
      [checked]="p['defaultChecked'] ?? p['checked'] ?? false"
      [label]="p['label']"
      [disabled]="!!p['disabled']"
      [required]="!!p['required']"
      [name]="p['name']"
      [aria-label]="p['aria-label']"
    ></label>
  `,
})
export class SwitchFixture {
  protected readonly p = parityProps();
}
