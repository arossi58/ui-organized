import { Component } from "@angular/core";
import { UioAccordion } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultValue` is React's uncontrolled initial set; `[value]` is both here,
 * for the reason `UioSwitch` gives.
 *
 * `multiple` is spelled out rather than defaulted in the template, because the
 * scenario that matters sends `false` and a missing binding would silently keep
 * the component's own `true`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioAccordion],
  template: `
    <div
      uioAccordion
      [items]="p['items'] ?? []"
      [value]="p['defaultValue']"
      [multiple]="p['multiple'] ?? true"
      [disabled]="p['disabled'] ?? false"
      [variant]="p['variant'] ?? 'default'"
      [size]="p['size'] ?? 'md'"
    ></div>
  `,
})
export class AccordionFixture {
  protected readonly p = parityProps();
}
