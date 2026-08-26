import { Component } from "@angular/core";
import { UioTooltip } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * React's case renders `<Tooltip content="Copy">Hover me</Tooltip>`, and because
 * the child is a string Ark renders its own `<button class="tooltip__trigger">`.
 * Angular's tooltip is a directive on the caller's element, so the button is
 * written here — which is what the trigger is in every real use of it.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTooltip],
  template: `
    <button
      [uioTooltip]="p['content']"
      [side]="p['side'] ?? 'top'"
      [align]="p['align'] ?? 'center'"
      [sideOffset]="p['sideOffset'] ?? 6"
      [delay]="p['delay']"
      [closeDelay]="p['closeDelay']"
    >Hover me</button>
  `,
})
export class TooltipFixture {
  protected readonly p = parityProps();
}
