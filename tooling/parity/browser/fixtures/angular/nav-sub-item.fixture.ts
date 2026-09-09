import { Component, inject, signal } from "@angular/core";
import { UioNavContext, UioNavSubItem } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * A sub-page button on its own, under a rail it may or may not obey.
 *
 * The context is provided and connected here rather than through
 * `UioNavProvider`, and the difference is only in the spelling: the provider is
 * an attribute directive, so writing it would mean a wrapper element that
 * React's context provider — which renders nothing — does not have. Connecting
 * the same context by hand keeps the compared DOM to the button itself.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioNavSubItem],
  providers: [UioNavContext],
  template: `
    <button
      uioNavSubItem
      label="Weekly"
      [icon]="p['icon']"
      [selected]="!!p['selected']"
      [disabled]="!!p['disabled']"
      [collapsed]="p['collapsed']"
    ></button>
  `,
})
export class NavSubItemFixture {
  protected readonly p = parityProps();

  constructor() {
    // `inject()` rather than a constructor parameter: these fixtures are
    // compiled by esbuild, which emits no `design:paramtypes`, so JIT has
    // nothing to resolve a parameter from.
    inject(UioNavContext).connect(signal(!!this.p["rail"]));
  }
}
