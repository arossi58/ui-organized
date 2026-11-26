import { Component } from "@angular/core";
import { UioButton, UioInput, UioInputEndAddon } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioInput, UioInputEndAddon, UioButton],
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
      [startIcon]="p['startIcon']"
      [endIcon]="p['endIcon']"
      [startAddon]="p['startAddon']"
      [endAddon]="p['endAddon']"
    >
      @if (p['withButton']) {
        <div uioInputEndAddon><button uioButton intent="secondary">Copy</button></div>
      }
    </div>
  `,
})
export class InputFixture {
  protected readonly p = parityProps();
}
