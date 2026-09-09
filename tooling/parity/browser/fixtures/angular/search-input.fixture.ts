import { Component } from "@angular/core";
import { UioSearchInput } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The value is the whole point of this fixture: the clear button exists only
 * while the field holds something, and it takes the control's trailing padding
 * class with it. React mirrors the value into state and re-syncs it from an
 * effect, Svelte derives it, and Angular's `model()` *is* what the element
 * shows — three routes that have to land on the same markup.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSearchInput],
  template: `
    <div
      uioSearchInput
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [size]="p['size'] ?? 'md'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [clearable]="p['clearable'] ?? true"
      [placeholder]="p['placeholder']"
      [value]="p['value'] ?? p['defaultValue'] ?? ''"
    ></div>
  `,
})
export class SearchInputFixture {
  protected readonly p = parityProps();
}
