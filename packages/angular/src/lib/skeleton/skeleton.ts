import { Component, Directive, computed, input } from "@angular/core";
import { skeletonStyles, type SkeletonVariants } from "@ui-organized/core";

export type SkeletonVariant = NonNullable<SkeletonVariants["variant"]>;

/** A number is treated as pixels; a string passes through as written. */
export function toCssSize(value: number | string | undefined): string | undefined {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * A loading placeholder, sized to the content it stands in for.
 *
 * ── One API difference, and why ─────────────────────────────────────────────
 *
 * The other three libraries take a `lines` prop and switch their own root
 * element: one line renders a `<span>`, several render a `<div
 * class="skeleton-group">` wrapping one `<span>` per line. An Angular directive
 * cannot change the element it is on — the caller wrote it — so the two shapes
 * are two directives, and the caller picks the tag that matches what they want.
 *
 * The rendered DOM is identical either way, which is the part that has to be
 * true. Hiding the difference behind one selector would mean an element wrapper
 * this design system does not have.
 *
 * ```html
 * <span uioSkeleton variant="circle" [width]="40" [height]="40"></span>
 * <div uioSkeletonGroup [lines]="3" [width]="200"></div>
 * ```
 */
@Directive({
  selector: "[uioSkeleton]",
  standalone: true,
  host: {
    "aria-hidden": "true",
    "[class]": "hostClass()",
    "[style.width]": "toCss(width())",
    "[style.height]": "toCss(height())",
  },
})
export class UioSkeleton {
  readonly variant = input<SkeletonVariant>("text");
  readonly animated = input(true);
  readonly width = input<number | string | undefined>(undefined);
  readonly height = input<number | string | undefined>(undefined);

  protected readonly toCss = toCssSize;
  protected readonly hostClass = computed(() =>
    skeletonStyles({ variant: this.variant(), animated: this.animated() }),
  );
}

/**
 * A stack of placeholder lines, with a shortened last row.
 *
 * The 60% on the final line is what makes a block of skeleton text read as text
 * rather than as a rectangle, and it belongs here rather than in the stylesheet
 * because only the component knows which line is last.
 */
@Component({
  selector: "[uioSkeletonGroup]",
  standalone: true,
  template: `
    @for (index of indices(); track index) {
      <span
        [class]="itemClass()"
        [style.width]="widthFor(index)"
        [style.height]="toCss(height())"
      ></span>
    }
  `,
  host: { class: "skeleton-group", "aria-hidden": "true" },
})
export class UioSkeletonGroup {
  readonly variant = input<SkeletonVariant>("text");
  readonly animated = input(true);
  readonly width = input<number | string | undefined>(undefined);
  readonly height = input<number | string | undefined>(undefined);
  readonly lines = input(1);

  protected readonly toCss = toCssSize;
  protected readonly indices = computed(() =>
    Array.from({ length: Math.max(1, this.lines()) }, (_, index) => index),
  );
  protected readonly itemClass = computed(() =>
    skeletonStyles({ variant: this.variant(), animated: this.animated() }),
  );

  protected widthFor(index: number): string {
    return index === this.indices().length - 1 ? "60%" : (toCssSize(this.width()) ?? "100%");
  }
}
