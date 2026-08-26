import { Component } from "@angular/core";
import { UioSelect } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultValue` in React is the uncontrolled initial value; a `model()` is
 * uncontrolled until something binds it, so `[value]` is both — the same fork
 * `UioSwitch` describes.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSelect],
  template: `
    <div
      uioSelect
      [options]="p['options'] ?? []"
      [label]="p['label']"
      [placeholder]="p['placeholder']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [name]="p['name']"
      [required]="p['required'] ?? false"
      [disabled]="p['disabled'] ?? false"
      [value]="p['defaultValue']"
    ></div>
  `,
})
export class SelectFixture {
  protected readonly p = parityProps();
}
