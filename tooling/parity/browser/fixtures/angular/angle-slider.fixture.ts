import { Component } from "@angular/core";
import { UioAngleSlider } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioAngleSlider],
  template: `
    <div
      uioAngleSlider
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [value]="p['value'] ?? p['defaultValue'] ?? 0"
      [step]="p['step'] ?? 1"
      [markers]="markers"
      [showValue]="p['showValue']"
      [size]="p['size'] ?? 'md'"
      [disabled]="!!p['disabled']"
      [readOnly]="!!p['readOnly']"
      [name]="p['name']"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class AngleSliderFixture {
  protected readonly p = parityProps();
  /**
   * Read once rather than defaulted in the template.
   *
   * `p['markers'] ?? []` builds a fresh array on every check, which is a new
   * input value each time — Angular's development-mode second pass then reports
   * the binding as having changed after it was checked, and the page never
   * mounts.
   */
  protected readonly markers: readonly number[] = this.p["markers"] ?? [];
}
