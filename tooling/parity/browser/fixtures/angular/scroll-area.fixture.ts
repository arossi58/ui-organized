import { Component } from "@angular/core";
import { UioScrollArea } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The five paragraphs are the case's content, spelled out here the way the
 * React and Svelte fixtures spell them out: a scroll area with nothing in it
 * cannot overflow, and overflow is the whole of what these scenarios wait for.
 *
 * The bounded height arrives as a style *record*, which is React's spelling —
 * Angular's `[style]` takes the same object, so no rename is needed.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioScrollArea],
  template: `
    <div uioScrollArea [orientation]="p['orientation'] ?? 'vertical'" [style]="p['style']">
      <p>One</p>
      <p>Two</p>
      <p>Three</p>
      <p>Four</p>
      <p>Five</p>
    </div>
  `,
})
export class ScrollAreaFixture {
  protected readonly p = parityProps();
}
