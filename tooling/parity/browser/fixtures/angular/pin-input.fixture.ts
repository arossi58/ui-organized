import { Component } from "@angular/core";
import { UioPinInput } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `value` and `defaultValue` collapse into one binding — see `UioSwitch` — and
 * both are the whole code as one string, which is the boundary the cells are
 * split at. A string longer than `length` is truncated on both sides.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioPinInput],
  template: `
    <div
      uioPinInput
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [length]="p['length'] ?? 4"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [type]="p['type'] ?? 'numeric'"
      [mask]="!!p['mask']"
      [otp]="!!p['otp']"
      [placeholder]="p['placeholder'] ?? '○'"
      [blurOnComplete]="!!p['blurOnComplete']"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [readOnly]="!!p['readOnly']"
      [name]="p['name']"
      [value]="p['value'] ?? p['defaultValue'] ?? ''"
    ></div>
  `,
})
export class PinInputFixture {
  protected readonly p = parityProps();
}
