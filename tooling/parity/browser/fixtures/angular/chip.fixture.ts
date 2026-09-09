import { Component } from "@angular/core";
import { UioChip } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `interactive` is passed through rather than derived: React makes the body a
 * button when it has an `onClick`, and a props object crossing the harness has
 * no handlers in it. Angular's own `dropdown`/`disabled` rules still apply on
 * top, so the four states the scenario drives line up either way.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioChip],
  template: `
    <span
      uioChip
      [variant]="p['variant'] ?? 'outline'"
      [size]="p['size'] ?? 'md'"
      [label]="p['label']"
      [detail]="p['detail']"
      [operator]="p['operator']"
      [operatorLabel]="p['operatorLabel']"
      [icon]="p['icon']"
      [dropdown]="p['dropdown'] ?? false"
      [selected]="p['selected'] ?? false"
      [incomplete]="p['incomplete'] ?? false"
      [disabled]="p['disabled'] ?? false"
      [removable]="p['removable'] ?? false"
      [removeLabel]="p['removeLabel']"
      >Admin</span
    >
  `,
})
export class ChipFixture {
  protected readonly p = parityProps();
}
