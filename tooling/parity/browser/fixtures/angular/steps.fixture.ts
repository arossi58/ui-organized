import { Component } from "@angular/core";
import { UioSteps } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `step` and `defaultStep` collapse into one binding — see `UioSwitch` — and
 * both count from `0` to `steps.length` inclusive, the last value meaning every
 * step is done.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSteps],
  template: `
    <div
      uioSteps
      [steps]="p['steps'] ?? []"
      [orientation]="p['orientation'] ?? 'horizontal'"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'numbered'"
      [linear]="!!p['linear']"
      [showContent]="p['showContent'] ?? true"
      [completedContent]="p['completedContent']"
      [step]="p['step'] ?? p['defaultStep'] ?? 0"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class StepsFixture {
  protected readonly p = parityProps();
}
