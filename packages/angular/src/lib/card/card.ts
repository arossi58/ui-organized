import { Directive, computed, input } from "@angular/core";
import { cardStyles, type CardVariants } from "@ui-organized/core";

export type CardVariant = NonNullable<CardVariants["variant"]>;
export type CardPadding = NonNullable<CardVariants["padding"]>;

/**
 * A surface with the design system's padding and elevation.
 *
 * A directive rather than a component, and an attribute rather than an element,
 * for the same reason as the button: `<uio-card>` would wrap the consumer's
 * content in an element the other three libraries do not render. There is
 * nothing to project — the caller's own children are already in the right place
 * — so there is no template either.
 *
 * ```html
 * <div uioCard variant="elevated" padding="lg">
 *   <div uioCardHeader>Title</div>
 *   <div uioCardBody>…</div>
 * </div>
 * ```
 */
@Directive({
  selector: "[uioCard]",
  standalone: true,
  host: { "[class]": "hostClass()" },
})
export class UioCard {
  readonly variant = input<CardVariant>("default");
  readonly padding = input<CardPadding>("md");

  protected readonly hostClass = computed(() =>
    cardStyles({ variant: this.variant(), padding: this.padding() }),
  );
}

@Directive({ selector: "[uioCardHeader]", standalone: true, host: { class: "card__header" } })
export class UioCardHeader {}

@Directive({ selector: "[uioCardBody]", standalone: true, host: { class: "card__body" } })
export class UioCardBody {}

@Directive({ selector: "[uioCardFooter]", standalone: true, host: { class: "card__footer" } })
export class UioCardFooter {}
