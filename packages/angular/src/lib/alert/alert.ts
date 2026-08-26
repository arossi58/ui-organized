import { Component, computed, input, output } from "@angular/core";
import { alertStyles, type AlertVariants } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioIcon } from "../icons/icon.js";

export type AlertVariant = NonNullable<AlertVariants["variant"]>;

/** Each variant announces itself with its own glyph before anyone reads the text. */
const VARIANT_ICONS: Record<AlertVariant, CanonicalIconName> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  error: "alert-circle",
};

/**
 * A prominent message about the state of something.
 *
 * `role="alert"` is a static host attribute rather than the caller's job: an
 * alert that assistive technology does not announce is a coloured box.
 *
 * ── One API difference ──────────────────────────────────────────────────────
 *
 * The other three render the dismiss button when an `onDismiss` callback is
 * passed — the presence of the prop *is* the switch. Angular has no equivalent
 * question to ask: an `output()` exists whether or not anyone subscribed, and
 * there is no supported way to find out. So the switch is explicit: set
 * `dismissible`, and listen to `(dismiss)`.
 *
 * ```html
 * <div uioAlert variant="error" title="Upload failed" dismissible (dismiss)="hide()">
 *   The file was larger than 10 MB.
 * </div>
 * ```
 */
@Component({
  selector: "div[uioAlert]",
  standalone: true,
  imports: [UioIcon],
  template: `
    <span class="alert__icon">
      <span uioIcon [name]="iconName()" [size]="ICON_SIZE"></span>
    </span>
    <div class="alert__body">
      @if (title(); as text) {
        <div class="alert__title text-strong-body-medium">{{ text }}</div>
      }
      <div class="alert__message text-default-body-medium"><ng-content /></div>
    </div>
    @if (dismissible()) {
      <button
        type="button"
        class="alert__dismiss"
        aria-label="Dismiss alert"
        (click)="dismiss.emit()"
      >
        <span uioIcon name="close" [size]="ICON_SIZE"></span>
      </button>
    }
  `,
  host: {
    role: "alert",
    "[class]": "hostClass()",
  },
})
export class UioAlert {
  readonly variant = input<AlertVariant>("info");
  readonly title = input<string | undefined>(undefined);
  /** Renders the dismiss button. See the note above for why this is not implied. */
  readonly dismissible = input(false);
  readonly dismiss = output<void>();

  protected readonly ICON_SIZE = 20;
  protected readonly hostClass = computed(() => alertStyles({ variant: this.variant() }));
  protected readonly iconName = computed(() => VARIANT_ICONS[this.variant()]);
}
