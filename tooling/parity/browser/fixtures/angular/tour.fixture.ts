import { Component } from "@angular/core";
import { UioTour } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `stepId` is bound as an initial value rather than two-way, which is the whole
 * of what the scenarios can drive: the tour opens on a *change* to it, and a
 * scenario supplies its props once. See the note on `UioTour` — the same is true
 * of the other three libraries, and it is why every Tour case here compares a
 * rendered-but-closed card.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTour],
  template: `
    <uio-tour
      [steps]="p['steps'] ?? []"
      [stepId]="p['stepId'] ?? null"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [showProgress]="p['showProgress'] ?? true"
      [spotlightRadius]="p['spotlightRadius'] ?? 4"
      [preventInteraction]="!!p['preventInteraction']"
      [closeOnInteractOutside]="p['closeOnInteractOutside'] ?? true"
      [closeOnEscape]="p['closeOnEscape'] ?? true"
    />
  `,
})
export class TourFixture {
  protected readonly p = parityProps();
}
