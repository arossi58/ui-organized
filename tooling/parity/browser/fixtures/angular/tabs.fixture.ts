import { Component } from "@angular/core";
import { UioTabs } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `defaultValue` in React is the uncontrolled initial value; a `model()` is
 * uncontrolled until something binds it, so `[value]` is both — the same fork
 * `UioSwitch` describes.
 *
 * The scenario's tab list carries strings for `content`, which is the shape all
 * four libraries accept. Angular additionally takes a `TemplateRef` there; that
 * has no counterpart in the other three and so nothing to compare against.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTabs],
  template: `
    <div
      uioTabs
      [tabs]="p['tabs'] ?? []"
      [value]="p['defaultValue']"
      [orientation]="p['orientation'] ?? 'horizontal'"
      [size]="p['size'] ?? 'default'"
    ></div>
  `,
})
export class TabsFixture {
  protected readonly p = parityProps();
}
