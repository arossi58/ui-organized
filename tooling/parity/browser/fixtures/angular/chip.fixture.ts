import { Component } from "@angular/core";
import { UioChip, UioChipSegment } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `segmented` is translated, exactly as the React builder in
 * `src/cases/Chip.tsx` translates it: a props object crossing the harness has no
 * handlers in it, so the intent — three segments that each open something —
 * is spelled here as three `<button uioChipSegment>`s with a no-op click.
 * `removable` is Angular's own input, so it passes straight through.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioChip, UioChipSegment],
  template: `
    <span
      uioChip
      [label]="p['label']"
      [operator]="p['operator']"
      [value]="p['value']"
      [selected]="p['selected'] ?? false"
      [incomplete]="p['incomplete'] ?? false"
      [disabled]="p['disabled'] ?? false"
      [removable]="p['removable'] ?? false"
      [removeLabel]="p['removeLabel']"
    >
      @if (p['segmented']) {
        <button uioChipSegment part="label" (click)="noop()">Name</button>
        <button uioChipSegment part="operator" (click)="noop()">is greater than</button>
        <button uioChipSegment part="value" (click)="noop()">30</button>
      }
    </span>
  `,
})
export class ChipFixture {
  protected readonly p = parityProps();
  protected noop(): void {}
}
