import { Component } from "@angular/core";
import { UioHoverCard, UioHoverCardTrigger } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * A trigger and a card, which is the whole of React's case.
 *
 * The delays are on the root in both libraries; `side`, `align` and the offsets
 * are on Content in React and on the root here, because Angular's card renders
 * its own surface rather than taking one as a child.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioHoverCard, UioHoverCardTrigger],
  template: `
    <button uioHoverCardTrigger [hoverCard]="h">Profile</button>
    <uio-hover-card
      #h="uioHoverCard"
      [open]="p['defaultOpen'] ?? false"
      [openDelay]="p['openDelay'] ?? 600"
      [closeDelay]="p['closeDelay'] ?? 300"
      [side]="content['side'] ?? 'bottom'"
      [align]="content['align'] ?? 'center'"
      [sideOffset]="content['sideOffset'] ?? 8"
      [alignOffset]="content['alignOffset'] ?? 0"
    >Preview</uio-hover-card>
  `,
})
export class HoverCardFixture {
  protected readonly p = parityProps();
  protected readonly content = this.p["contentProps"] ?? {};
}
