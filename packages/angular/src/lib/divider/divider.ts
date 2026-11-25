import { Directive, booleanAttribute, computed, input } from "@angular/core";
import { dividerStyles, type DividerVariants } from "@ui-organized/core";

export type DividerOrientation = NonNullable<DividerVariants["orientation"]>;
export type DividerSpacing = NonNullable<DividerVariants["spacing"]>;
export type DividerLabelPosition = NonNullable<DividerVariants["labelPosition"]>;

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
    "[attr.role]": "labelled() ? null : 'separator'",
    "[attr.aria-orientation]": "labelled() ? null : orientation()",
    "[class]": "hostClass()",
  },
})
export class UioDivider {
  readonly orientation = input<DividerOrientation>("horizontal");
  readonly spacing = input<DividerSpacing>("none");
  /**
   * The divider holds a label: text such as "or", or a control such as a "Show
   * more" button, written as its content. The other three see their children;
   * a directive cannot see projected text, so it is told.
   *
   * With a label it is not a separator, because a separator's children are
   * presentational and the label would never be read. It is horizontal, and
   * the rules are drawn either side of the label by CSS.
   *
   * ```html
   * <div uioDivider labelled>or</div>
   * ```
   */
  readonly labelled = input(false, { transform: booleanAttribute });
  /** Where the label sits. Only applies with `labelled`. */
  readonly labelPosition = input<DividerLabelPosition>("center");

  protected readonly hostClass = computed(() =>
    this.labelled()
      ? dividerStyles({
          orientation: "horizontal",
          spacing: this.spacing(),
          labelled: true,
          labelPosition: this.labelPosition(),
        })
      : dividerStyles({ orientation: this.orientation(), spacing: this.spacing() }),
  );
}
