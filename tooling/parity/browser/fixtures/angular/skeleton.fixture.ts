import { Component, computed } from "@angular/core";
import { UioSkeleton, UioSkeletonGroup } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The one place a fixture makes a choice the component makes elsewhere.
 *
 * React, Svelte and Vue switch their own root element on `lines`; an Angular
 * directive cannot change the element the caller wrote, so the library exposes
 * the two shapes as two directives and the caller picks. That decision has to
 * happen somewhere, and here it is deliberately visible rather than hidden — the
 * *rendered DOM* is still compared against React's, which is the claim that
 * matters.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSkeleton, UioSkeletonGroup],
  template: `
    @if (multiline()) {
      <div
        uioSkeletonGroup
        [variant]="p['variant'] ?? 'text'"
        [animated]="p['animated'] ?? true"
        [width]="p['width']"
        [height]="p['height']"
        [lines]="p['lines']"
      ></div>
    } @else {
      <span
        uioSkeleton
        [variant]="p['variant'] ?? 'text'"
        [animated]="p['animated'] ?? true"
        [width]="p['width']"
        [height]="p['height']"
      ></span>
    }
  `,
})
export class SkeletonFixture {
  protected readonly p = parityProps();
  protected readonly multiline = computed(
    () => (this.p["variant"] ?? "text") === "text" && (this.p["lines"] ?? 1) > 1,
  );
}
