import { Component } from "@angular/core";
import { UioPasswordInput } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `showToggle` is spelled out rather than defaulted in the component alone,
 * because the case that matters sends `false` and a missing binding would
 * silently keep the default `true` — along with the trailing padding class that
 * comes with it.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioPasswordInput],
  template: `
    <div
      uioPasswordInput
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [showToggle]="p['showToggle'] ?? true"
      [name]="p['name']"
      [placeholder]="p['placeholder']"
    ></div>
  `,
})
export class PasswordInputFixture {
  protected readonly p = parityProps();
}
