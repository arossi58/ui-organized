import { Component } from "@angular/core";
import { UioSignaturePad } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `paths` and `defaultPaths` are one input: a `model()` is uncontrolled until
 * something binds it, so the fork React implements by hand does not arise — the
 * same arrangement `UioSwitch` describes.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSignaturePad],
  template: `
    <div
      uioSignaturePad
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [paths]="p['paths'] ?? p['defaultPaths'] ?? []"
      [strokeWidth]="p['strokeWidth'] ?? 2"
      [showGuide]="p['showGuide'] ?? true"
      [showClear]="p['showClear'] ?? true"
      [clearLabel]="p['clearLabel'] ?? 'Clear'"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [readOnly]="!!p['readOnly']"
      [name]="p['name']"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class SignaturePadFixture {
  protected readonly p = parityProps();
}
