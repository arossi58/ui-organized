import { Component } from "@angular/core";
import { UioNumberField } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `value` and `defaultValue` collapse into one binding — see `UioSwitch` — and
 * a controlled `null` arrives here as an empty field, which is what it means.
 *
 * There is no `id` binding, and no case needs one: React takes an explicit `id`
 * so a caller can point a label at the control by hand, while Angular's field
 * context issues every id in the group and wires the label itself. The gate
 * numbers ids positionally, so the *relationship* is what it compares, and that
 * is identical either way.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioNumberField],
  template: `
    <div
      uioNumberField
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [required]="!!p['required']"
      [readOnly]="!!p['readOnly']"
      [disabled]="!!p['disabled']"
      [name]="p['name']"
      [placeholder]="p['placeholder']"
      [min]="p['min']"
      [max]="p['max']"
      [step]="p['step']"
      [format]="p['format']"
      [value]="p['value'] ?? p['defaultValue']"
    ></div>
  `,
})
export class NumberFieldFixture {
  protected readonly p = parityProps();
}
