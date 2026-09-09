import { Directive, computed, input } from "@angular/core";
import { dividerStyles, type DividerVariants } from "@ui-organized/core";

export type DividerOrientation = NonNullable<DividerVariants["orientation"]>;
export type DividerSpacing = NonNullable<DividerVariants["spacing"]>;

/**
 * A thin rule between content or controls.
 *
 * `role="separator"` is a static host attribute rather than something the caller
 * writes, because a divider that does not announce itself as one is not a
 * divider — it is a styled div. The orientation is bound because assistive
 * technology needs to know which way the rule runs, and it is the one thing here
 * that can change.
 */
@Directive({
  selector: "[uioDivider]",
  standalone: true,
  host: {
    role: "separator",
    "[attr.aria-orientation]": "orientation()",
    "[class]": "hostClass()",
  },
})
export class UioDivider {
  readonly orientation = input<DividerOrientation>("horizontal");
  readonly spacing = input<DividerSpacing>("none");

  protected readonly hostClass = computed(() =>
    dividerStyles({ orientation: this.orientation(), spacing: this.spacing() }),
  );
}
