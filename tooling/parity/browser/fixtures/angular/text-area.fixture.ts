import { Component } from "@angular/core";
import { UioTextArea } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTextArea],
  template: `
    <div
      uioTextArea
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [resize]="p['resize'] ?? 'both'"
      [rows]="p['rows']"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [placeholder]="p['placeholder']"
    ></div>
  `,
})
export class TextAreaFixture {
  protected readonly p = parityProps();
}
