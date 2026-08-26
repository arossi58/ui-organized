import { Component } from "@angular/core";
import { UioMeter } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioMeter],
  template: `
    <div
      uioMeter
      [value]="p['value'] ?? 0"
      [min]="p['min'] ?? 0"
      [max]="p['max'] ?? 100"
      [label]="p['label']"
      [showValue]="!!p['showValue']"
      [format]="p['format']"
      [variant]="p['variant'] ?? 'default'"
      [size]="p['size'] ?? 'md'"
      [aria-label]="p['aria-label']"
    ></div>
  `,
})
export class MeterFixture {
  protected readonly p = parityProps();
}
