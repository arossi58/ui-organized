import { Component } from "@angular/core";
import { UioListbox } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultValue` in React is the uncontrolled initial value; a `model()` is
 * uncontrolled until something binds it, so `[value]` is both — the same fork
 * `UioSwitch` describes. The controlled `value` case lands in the same place.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioListbox],
  template: `
    <div
      uioListbox
      [options]="p['options'] ?? []"
      [label]="p['label']"
      [value]="p['defaultValue'] ?? p['value'] ?? []"
      [selectionMode]="p['selectionMode'] ?? 'single'"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [emptyMessage]="p['emptyMessage'] ?? 'No options'"
      [disabled]="p['disabled'] ?? false"
    ></div>
  `,
})
export class ListboxFixture {
  protected readonly p = parityProps();
}
