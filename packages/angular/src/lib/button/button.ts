import { Component, ElementRef, computed, inject, input } from "@angular/core";
import { clsx } from "clsx";
import {
  CONTROL_TEXT_CLASS,
  buttonStyles,
  type ButtonVariants,
  type ControlSize,
} from "@ui-organized/core";

export type ButtonIntent = NonNullable<ButtonVariants["intent"]>;

/**
 * The design system's button.
 *
 * ── Why it is an attribute, not an element ──────────────────────────────────
 *
 * `<uio-button>` would render a wrapper around the real `<button>`, and the
 * whole premise of this package is that it produces the same DOM as the other
 * three libraries against one shared stylesheet — an extra element is a
 * different DOM. Selecting on the attribute means the consumer's own element is
 * the button:
 *
 * ```html
 * <button uioButton intent="secondary" size="lg">Save</button>
 * <a uioButton href="/docs">Read the docs</a>
 * ```
 *
 * It also settles polymorphism for free. React needs a `render` prop and a
 * `cloneElement` to turn a Button into an anchor; here the caller just writes an
 * anchor. That is the same capability, expressed in the idiom of the framework.
 *
 * This deliberately does **not** extend `UioPart`: Ark has no button primitive,
 * so a React button carries no `data-scope`/`data-part` and neither may this one.
 */
@Component({
  selector: "button[uioButton], a[uioButton]",
  standalone: true,
  template: "<ng-content />",
  host: {
    "[class]": "hostClass()",
    "[attr.type]": "typeAttribute()",
  },
})
export class UioButton {
  readonly intent = input<ButtonIntent>("primary");
  readonly size = input<ControlSize>("md");
  /**
   * Only meaningful on a `<button>`, and defaulted to `button` there for the
   * same reason the React component does it: a bare `<button>` inside a form
   * submits it, which is almost never what a design-system button is for.
   */
  readonly type = input<"button" | "submit" | "reset">("button");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly hostClass = computed(() =>
    clsx(CONTROL_TEXT_CLASS[this.size()], buttonStyles({ intent: this.intent(), size: this.size() })),
  );

  /** An anchor has no `type`, and stamping one on it would be invalid HTML. */
  protected readonly typeAttribute = computed(() =>
    this.host.nativeElement.tagName === "BUTTON" ? this.type() : null,
  );
}
