import { Component } from "@angular/core";
import { UioTagsInput } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `max` has to be bound to a real number rather than left undefined: the input
 * has `Infinity` as its default, and binding `undefined` would replace it
 * instead of falling back to it.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTagsInput],
  template: `
    <div
      uioTagsInput
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [placeholder]="p['placeholder']"
      [size]="p['size'] ?? 'md'"
      [max]="p['max'] ?? unlimited"
      [editable]="p['editable'] ?? true"
      [delimiter]="p['delimiter'] ?? ','"
      [addOnPaste]="!!p['addOnPaste']"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [readOnly]="!!p['readOnly']"
      [name]="p['name']"
      [value]="p['value'] ?? p['defaultValue'] ?? []"
    ></div>
  `,
})
export class TagsInputFixture {
  protected readonly p = parityProps();
  protected readonly unlimited = Number.POSITIVE_INFINITY;
}
