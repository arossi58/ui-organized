import { Component } from "@angular/core";
import {
  UioContextMenu,
  UioContextMenuItem,
  UioContextMenuSeparator,
  UioContextMenuTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Two items and a rule, which is React's case.
 *
 * Opened through `[open]` rather than by right-clicking, exactly as the
 * scenario's `defaultOpen` does for the other three — see `ContextMenu.ts` for
 * why the step vocabulary has no right-click in it, and why a menu opened this
 * way carries no placement in any library.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioContextMenu, UioContextMenuTrigger, UioContextMenuItem, UioContextMenuSeparator],
  template: `
    <div uioContextMenuTrigger [contextMenu]="m">Right-click here</div>
    <uio-context-menu
      #m="uioContextMenu"
      [open]="p['defaultOpen'] ?? false"
      [sideOffset]="content['sideOffset'] ?? 4"
      [alignOffset]="content['alignOffset'] ?? 0"
    >
      <div uioContextMenuItem value="a">Cut</div>
      <div uioContextMenuSeparator></div>
      <div uioContextMenuItem value="b" destructive>Delete</div>
    </uio-context-menu>
  `,
})
export class ContextMenuFixture {
  protected readonly p = parityProps();
  protected readonly content = this.p["contentProps"] ?? {};
}
