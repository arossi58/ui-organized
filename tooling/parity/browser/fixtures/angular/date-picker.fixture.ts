import { Component } from "@angular/core";
import { UioDatePicker } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultValue` binds to `[value]` — see `DateInputFixture`. Read into a field
 * rather than written as a literal in the template, because a new array every
 * change-detection pass would re-set the model and undo any selection.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDatePicker],
  template: `
    <div
      uioDatePicker
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [selectionMode]="p['selectionMode'] ?? 'single'"
      [min]="p['min']"
      [max]="p['max']"
      [numOfMonths]="p['numOfMonths'] ?? 1"
      [locale]="p['locale']"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [readOnly]="!!p['readOnly']"
      [name]="p['name']"
      [value]="initial"
    ></div>
  `,
})
export class DatePickerFixture {
  protected readonly p = parityProps();
  protected readonly initial = (this.p["defaultValue"] ?? []) as string[];
}
