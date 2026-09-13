import { Component } from "@angular/core";
import { UioInput } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioInput],
  template: `
    <div
      uioInput
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [type]="p['type']"
      [placeholder]="p['placeholder']"
    ></div>
  `,
})
export class InputFixture {
  protected readonly p = parityProps();
}
