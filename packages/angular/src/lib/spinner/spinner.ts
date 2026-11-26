import { Directive, booleanAttribute, computed, input } from "@angular/core";
import { spinnerStyles, type SpinnerVariants } from "@ui-organized/core";

export type SpinnerSize = NonNullable<SpinnerVariants["size"]>;

/**
 * An indeterminate loading indicator: a turning ring in the current text
 * colour. For work whose progress can be measured, use Progress; for content
 * whose shape is known before it arrives, use Skeleton.
 *
 * An attribute directive on the caller's own `<span>`, like every presentational
 * part here, so the DOM is the same single element the other three libraries
 * render:
 *
 * ```html
 * <span uioSpinner size="lg" label="Loading results"></span>
 * ```
 */
@Directive({
  selector: "[uioSpinner]",
  standalone: true,
  host: {
    "[class]": "hostClass()",
    "[attr.role]": "decorative() ? null : 'status'",
    "[attr.aria-label]": "decorative() ? null : label()",
    "[attr.aria-hidden]": "decorative() ? 'true' : null",
  },
})
export class UioSpinner {
  /** sm, md and lg are 16, 20 and 24 px, a control's icon size; xl is 40 px. */
  readonly size = input<SpinnerSize>("md");
  /** What is loading, announced by assistive technology. */
  readonly label = input("Loading");
  /** Hide it from assistive technology, when something else already says the work is running. */
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly hostClass = computed(() => spinnerStyles({ size: this.size() }));
}
