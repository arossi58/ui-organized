import { Component, computed, input } from "@angular/core";
import {
  FEATURED_ICON_GLYPH_SIZE,
  featuredIconStyles,
  type FeaturedIconVariants,
} from "@ui-organized/core";
import { UioIcon, type IconName } from "../icons/icon.js";
import type { IconGlyph } from "../icons/glyph.js";

export type FeaturedIconVariant = NonNullable<FeaturedIconVariants["variant"]>;
export type FeaturedIconAppearance = NonNullable<FeaturedIconVariants["appearance"]>;
export type FeaturedIconShape = NonNullable<FeaturedIconVariants["shape"]>;
export type FeaturedIconSize = NonNullable<FeaturedIconVariants["size"]>;

/**
 * An icon in a tinted shape, the piece empty states, modal headers, feature
 * grids and metric cards are built around. Decorative unless given a `label`.
 *
 * An attribute on the caller's own `<span>`, so the DOM is the single element
 * with one icon inside that the other three libraries render:
 *
 * ```html
 * <span uioFeaturedIcon icon="inbox" variant="neutral" size="lg"></span>
 * ```
 */
@Component({
  selector: "span[uioFeaturedIcon]",
  standalone: true,
  imports: [UioIcon],
  template: `<span uioIcon [name]="icon()" [size]="glyphSize()"></span>`,
  host: {
    "[class]": "hostClass()",
    "[attr.role]": "label() ? 'img' : null",
    "[attr.aria-label]": "label() || null",
    "[attr.aria-hidden]": "label() ? null : 'true'",
  },
})
export class UioFeaturedIcon {
  /** The icon's native name in the active set, or a system glyph. */
  readonly icon = input.required<IconName | IconGlyph>();
  readonly variant = input<FeaturedIconVariant>("brand");
  readonly appearance = input<FeaturedIconAppearance>("subtle");
  readonly shape = input<FeaturedIconShape>("circle");
  readonly size = input<FeaturedIconSize>("md");
  /** An accessible name, for an icon that means something on its own. */
  readonly label = input<string | undefined>(undefined);

  protected readonly glyphSize = computed(() => FEATURED_ICON_GLYPH_SIZE[this.size()]);
  protected readonly hostClass = computed(() =>
    featuredIconStyles({
      variant: this.variant(),
      appearance: this.appearance(),
      shape: this.shape(),
      size: this.size(),
    }),
  );
}
