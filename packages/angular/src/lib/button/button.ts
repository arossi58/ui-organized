import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { clsx } from "clsx";
import {
  CONTROL_ICON_SIZE,
  CONTROL_TEXT_CLASS,
  buttonStyles,
  type ButtonVariants,
  type ControlSize,
} from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioIcon } from "../icons/icon.js";

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
  imports: [UioIcon],
  template: `
    @if (icon(); as name) {
      @if (iconPosition() === "left") {
        <span uioIcon [name]="name" [size]="iconSize()"></span>
      }
    }
    <ng-content />
    @if (icon(); as name) {
      @if (iconPosition() === "right") {
        <span uioIcon [name]="name" [size]="iconSize()"></span>
      }
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[attr.type]": "typeAttribute()",
  },
})
export class UioButton implements AfterViewInit {
  readonly intent = input<ButtonIntent>("primary");
  readonly size = input<ControlSize>("md");
  /**
   * Only meaningful on a `<button>`, and defaulted to `button` there for the
   * same reason the React component does it: a bare `<button>` inside a form
   * submits it, which is almost never what a design-system button is for.
   */
  readonly type = input<"button" | "submit" | "reset">("button");
  readonly icon = input<CanonicalIconName | undefined>(undefined);
  readonly iconPosition = input<"left" | "right">("left");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Icons scale with the control size, from the shared table. */
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);

  /**
   * An icon with no label collapses to a square whose side matches the labelled
   * height for the size, so icon buttons line up with text buttons instead of
   * rendering short and wide.
   *
   * React derives this from its `children` prop. Angular projects content rather
   * than receiving it, so the equivalent question is whether anything the caller
   * put inside the button renders text — which the host's own `textContent`
   * answers, the icon contributing none. Read once after the view exists: a
   * button that starts as an icon and later grows a label is not a case any of
   * the four libraries supports.
   */
  private readonly iconOnly = signal(false);

  protected readonly hostClass = computed(() =>
    clsx(
      CONTROL_TEXT_CLASS[this.size()],
      buttonStyles({ intent: this.intent(), size: this.size() }),
      this.iconOnly() && "btn--icon-only",
    ),
  );

  ngAfterViewInit(): void {
    this.iconOnly.set(!!this.icon() && !this.host.nativeElement.textContent?.trim());
  }

  /** An anchor has no `type`, and stamping one on it would be invalid HTML. */
  protected readonly typeAttribute = computed(() =>
    this.host.nativeElement.tagName === "BUTTON" ? this.type() : null,
  );
}
