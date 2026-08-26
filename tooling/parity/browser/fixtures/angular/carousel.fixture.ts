import { Component } from "@angular/core";
import { UioCarousel } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Slide content is a plain string in every library's case — see the SSR spec for
 * why that is the one value all four accept unchanged. Angular additionally
 * takes a `TemplateRef` there, which has no counterpart in the other three.
 *
 * `page` and `defaultPage` are one input here: `model()` is uncontrolled until
 * something binds it, so the controlled/uncontrolled fork React implements by
 * hand does not arise, and the fixture takes whichever the scenario supplied.
 *
 * `loop` is passed straight through, `undefined` and all. It is deliberately not
 * defaulted: the machine derives it from `autoplay`, and a fixture that turned an
 * absent `loop` into `false` would hide exactly the bug the autoplay cases exist
 * to catch.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCarousel],
  template: `
    <div
      uioCarousel
      [slides]="p['slides'] ?? []"
      [label]="p['label']"
      [page]="p['page'] ?? p['defaultPage'] ?? 0"
      [slidesPerPage]="p['slidesPerPage'] ?? 1"
      [spacing]="p['spacing'] ?? 'var(--spacing-space-04)'"
      [loop]="p['loop']"
      [autoplay]="p['autoplay']"
      [orientation]="p['orientation'] ?? 'horizontal'"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [showIndicators]="p['showIndicators'] ?? true"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class CarouselFixture {
  protected readonly p = parityProps();
}
