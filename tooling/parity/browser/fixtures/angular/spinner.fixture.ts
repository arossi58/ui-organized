import { Component } from "@angular/core";
import { UioSpinner } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSpinner],
  template: `
    <span
      uioSpinner
      [size]="p['size'] ?? 'md'"
      [label]="p['label'] ?? 'Loading'"
      [decorative]="!!p['decorative']"
      [class]="p['class'] ?? ''"
    ></span>
  `,
})
export class SpinnerFixture {
  protected readonly p = parityProps();
}
