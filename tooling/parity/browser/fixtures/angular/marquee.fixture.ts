import { Component } from "@angular/core";
import { UioMarquee } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Item content is a plain string in every library's case — see the SSR spec for
 * why that is the one value all four accept unchanged.
 *
 * `defaultPaused` becomes `[paused]`: a `model()` is uncontrolled until
 * something binds it, so the initial value and the controlled one are the same
 * input, the fork `UioSwitch` describes.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioMarquee],
  template: `
    <div
      uioMarquee
      [items]="p['items'] ?? []"
      [speed]="p['speed'] ?? 50"
      [delay]="p['delay'] ?? 0"
      [orientation]="p['orientation'] ?? 'horizontal'"
      [reverse]="!!p['reverse']"
      [spacing]="p['spacing'] ?? 'var(--spacing-space-04)'"
      [autoFill]="p['autoFill'] ?? true"
      [pauseOnInteraction]="!!p['pauseOnInteraction']"
      [paused]="!!p['defaultPaused']"
      [loopCount]="p['loopCount'] ?? 0"
      [showEdges]="p['showEdges'] ?? true"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class MarqueeFixture {
  protected readonly p = parityProps();
}
