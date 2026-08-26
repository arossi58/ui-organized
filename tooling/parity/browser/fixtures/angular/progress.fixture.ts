import { Component } from "@angular/core";
import { UioProgress } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `?? null` rather than a default on the input, because `null` *is* the value
 * here: it is what makes a bar indeterminate, and the case that passes no value
 * at all is asking for exactly that.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioProgress],
  template: `
    <div
      uioProgress
      [value]="p['value'] ?? null"
      [max]="p['max'] ?? 100"
      [label]="p['label']"
      [showValue]="!!p['showValue']"
      [variant]="p['variant'] ?? 'default'"
      [size]="p['size'] ?? 'md'"
      [shape]="p['shape'] ?? 'linear'"
    ></div>
  `,
})
export class ProgressFixture {
  protected readonly p = parityProps();
}
