import { Component } from "@angular/core";
import { UioMenu, UioMenuItem, UioMenuSeparator, UioMenuTrigger } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * React's case puts `side`/`sideOffset` on `<MenuContent>`; Angular's surface is
 * the menu itself, so the scenario's `contentProps` land on `<uio-menu>`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioMenu, UioMenuTrigger, UioMenuItem, UioMenuSeparator],
  template: `
    <button uioMenuTrigger [menu]="m">Open</button>
    <uio-menu
      #m="uioMenu"
      [side]="content['side'] ?? 'bottom'"
      [align]="content['align'] ?? 'start'"
      [sideOffset]="content['sideOffset'] ?? 4"
      [alignOffset]="content['alignOffset'] ?? 0"
    >
      <div uioMenuItem value="a">Cut</div>
      <div uioMenuSeparator></div>
      <div uioMenuItem value="b" destructive>Delete</div>
    </uio-menu>
  `,
})
export class MenuFixture {
  protected readonly props = parityProps();
  protected readonly content = (this.props["contentProps"] ?? {}) as Record<string, any>;
}
