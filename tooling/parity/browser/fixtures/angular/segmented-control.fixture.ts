import { Component } from "@angular/core";
import { UioSegmentedControl } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `value` and `defaultValue` are one binding — see `UioSwitch` — and an unset
 * one falls back to the first segment in both libraries, so the indicator always
 * has somewhere to be.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSegmentedControl],
  template: `
    <div
      uioSegmentedControl
      [items]="p['items'] ?? []"
      [value]="p['value'] ?? p['defaultValue']"
      [size]="p['size'] ?? 'md'"
      [disabled]="!!p['disabled']"
      [name]="p['name']"
      [aria-label]="p['aria-label']"
    ></div>
  `,
})
export class SegmentedControlFixture {
  protected readonly p = parityProps();
}
