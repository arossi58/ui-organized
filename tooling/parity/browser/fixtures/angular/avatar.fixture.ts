import { Component } from "@angular/core";
import { UioAvatar } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The image cases point at a path the harness does not serve, so the request
 * 404s and every library settles on its fallback — which is the state worth
 * comparing anyway: React, Svelte, Vue and Angular all have to keep the `<img>`
 * rendered and `hidden` rather than dropping it.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioAvatar],
  template: `
    <div
      uioAvatar
      [src]="p['src']"
      [alt]="p['alt']"
      [name]="p['name']"
      [fallback]="p['fallback']"
      [size]="p['size'] ?? 'md'"
      [shape]="p['shape']"
    ></div>
  `,
})
export class AvatarFixture {
  protected readonly p = parityProps();
}
