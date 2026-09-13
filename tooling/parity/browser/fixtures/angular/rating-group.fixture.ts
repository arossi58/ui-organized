import { Component } from "@angular/core";
import { UioRatingGroup } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `-1` rather than `0` for "no rating": zero is a real value the arrow keys can
 * reach, and the hidden input carries the two apart.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioRatingGroup],
  template: `
    <div
      uioRatingGroup
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [count]="p['count'] ?? 5"
      [allowHalf]="!!p['allowHalf']"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [readOnly]="!!p['readOnly']"
      [disabled]="!!p['disabled']"
      [required]="!!p['required']"
      [name]="p['name'] ?? 'rating'"
      [value]="p['value'] ?? p['defaultValue'] ?? -1"
    ></div>
  `,
})
export class RatingGroupFixture {
  protected readonly p = parityProps();
}
