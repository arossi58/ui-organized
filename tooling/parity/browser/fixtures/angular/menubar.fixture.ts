import { Component } from "@angular/core";
import { UioMenu, UioMenuItem, UioMenuTrigger, UioMenubar } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Two real menus in the bar, because the part worth pinning is what the bar does
 * *to* them: a `role="menubar"` may only contain menuitems, so each trigger has
 * to stop being a button and start being one. The bar cannot pass that down —
 * the menus are independent overlays — so it travels on an injected provider,
 * and this fixture is what proves it arrived.
 *
 * `menubar__trigger` is written by the caller in every library; it is the class
 * the shared stylesheet gives a trigger placed in a bar.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioMenubar, UioMenu, UioMenuTrigger, UioMenuItem],
  template: `
    <div uioMenubar [orientation]="p['orientation'] ?? 'horizontal'">
      <button uioMenuTrigger class="menubar__trigger" [menu]="file">File</button>
      <uio-menu #file="uioMenu">
        <div uioMenuItem value="new">New</div>
      </uio-menu>

      <button uioMenuTrigger class="menubar__trigger" [menu]="edit">Edit</button>
      <uio-menu #edit="uioMenu">
        <div uioMenuItem value="undo">Undo</div>
      </uio-menu>
    </div>
  `,
})
export class MenubarFixture {
  protected readonly p = parityProps();
}
