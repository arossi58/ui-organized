import { Component } from "@angular/core";
import { UioButton, UioDivider, UioToolbar, UioToolbarGroup } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Composed from the library's own controls rather than bare `<button>`s, because
 * that is what the component is for: it owns the surface and the gaps, and the
 * guidance is to fill it with `Button`, `Input` and `Divider`. Button and Divider
 * are compared by their own cases, so a failure here is the toolbar's.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioToolbar, UioToolbarGroup, UioButton, UioDivider],
  template: `
    <div uioToolbar [orientation]="p['orientation'] ?? 'horizontal'">
      <div uioToolbarGroup>
        <button uioButton intent="ghost" size="sm">Bold</button>
        <button uioButton intent="ghost" size="sm">Italic</button>
      </div>
      <div uioDivider orientation="vertical"></div>
      <button uioButton intent="ghost" size="sm">Link</button>
    </div>
  `,
})
export class ToolbarFixture {
  protected readonly p = parityProps();
}
