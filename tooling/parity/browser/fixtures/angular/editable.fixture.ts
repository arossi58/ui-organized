import { Component } from "@angular/core";
import { UioEditable } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioEditable],
  template: `
    <div
      uioEditable
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [placeholder]="p['placeholder']"
      [size]="p['size'] ?? 'md'"
      [activationMode]="p['activationMode'] ?? 'focus'"
      [submitMode]="p['submitMode'] ?? 'both'"
      [showControls]="!!p['showControls']"
      [autoResize]="!!p['autoResize']"
      [maxLength]="p['maxLength']"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [readOnly]="!!p['readOnly']"
      [name]="p['name']"
      [value]="p['value'] ?? p['defaultValue'] ?? ''"
    ></div>
  `,
})
export class EditableFixture {
  protected readonly p = parityProps();
}
