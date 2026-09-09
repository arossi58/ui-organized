import { Component } from "@angular/core";
import { UioCombobox } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultValue` in React is the uncontrolled initial value; a `model()` is
 * uncontrolled until something binds it, so `[value]` is both — the same fork
 * `UioSwitch` describes.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCombobox],
  template: `
    <div
      uioCombobox
      [options]="p['options'] ?? []"
      [label]="p['label']"
      [placeholder]="p['placeholder']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [name]="p['name']"
      [required]="p['required'] ?? false"
      [disabled]="p['disabled'] ?? false"
      [emptyMessage]="p['emptyMessage'] ?? 'No results found.'"
      [value]="p['defaultValue'] ?? p['value']"
    ></div>
  `,
})
export class ComboboxFixture {
  protected readonly p = parityProps();
}
