import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
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
import { UioIcon } from "../icons/icon.js";
import type { IconGlyph } from "../icons/glyph.js";
import type { IconName } from "../icons/icon.js";
import { UioSpinner } from "../spinner/spinner.js";

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
 * ── Loading, and why there is no `disabled` input ───────────────────────────
 *
 * `loading` marks the host busy instead of disabling it, so focus is not thrown
 * back to the document when a request starts, and swallows the click. Its
 * spinner takes the icon's slot, or the leading one when there is no icon. On
 * an `<a>` it also takes the `href` off while it runs, the way the other three
 * libraries render a loading `href` button.
 *
 * `disabled` stays the native property. An input of that name would shadow
 * `<button [disabled]>` everywhere this button is used, and under JIT, where
 * signal inputs are not registered, its host binding would strip the native
 * attribute the template just set. The cost is a disabled *anchor*, which the
 * other three libraries render as an inert link: Angular's compiler rejects
 * `[disabled]` on `<a>` anyway, so the caller renders a `<button>` instead.
 *
 * This deliberately does **not** extend `UioPart`: Ark has no button primitive,
 * so a React button carries no `data-scope`/`data-part` and neither may this one.
 */
@Component({
  selector: "button[uioButton], a[uioButton]",
  standalone: true,
  imports: [UioIcon, UioSpinner],
  template: `
    @if (loading()) {
      @if (spinnerSide() === "left") {
        <span uioSpinner [size]="size()" decorative></span>
      }
    } @else if (icon(); as name) {
      @if (iconPosition() === "left") {
        <span uioIcon [name]="name" [size]="iconSize()"></span>
      }
    }
    <ng-content />
    @if (loading()) {
      @if (spinnerSide() === "right") {
        <span uioSpinner [size]="size()" decorative></span>
      }
    } @else if (icon(); as name) {
      @if (iconPosition() === "right") {
        <span uioIcon [name]="name" [size]="iconSize()"></span>
      }
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[attr.type]": "typeAttribute()",
    "[attr.role]": "isAnchor && loading() ? 'link' : null",
    "[attr.aria-disabled]": "loading() ? 'true' : null",
    "[attr.aria-busy]": "loading() ? 'true' : null",
    "[attr.data-loading]": "loading() ? '' : null",
    "(click)": "onClick($event)",
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
  readonly icon = input<IconName | IconGlyph | undefined>(undefined);
  readonly iconPosition = input<"left" | "right">("left");
  readonly loading = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  protected readonly isAnchor = this.host.nativeElement.tagName === "A";

  /** Icons scale with the control size, from the shared table. */
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);
  protected readonly spinnerSide = computed(() => (this.icon() ? this.iconPosition() : "left"));

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

  /**
   * The `href` the caller wrote, held while the anchor is loading.
   *
   * Taken off the element rather than bound: `[attr.href]` here would fight
   * RouterLink, which binds the same attribute, and lose or win depending on
   * directive order. A binding the caller changes while the anchor is loading
   * (`[href]`) writes the attribute back; that case is not supported.
   */
  private heldHref: string | null = null;

  constructor() {
    effect(() => {
      if (!this.isAnchor) return;
      const element = this.host.nativeElement;
      if (this.loading()) {
        const href = element.getAttribute("href");
        if (href !== null) {
          this.heldHref = href;
          this.renderer.removeAttribute(element, "href");
        }
      } else if (this.heldHref !== null) {
        this.renderer.setAttribute(element, "href", this.heldHref);
        this.heldHref = null;
      }
    });
  }

  ngAfterViewInit(): void {
    this.iconOnly.set(!!this.icon() && !this.host.nativeElement.textContent?.trim());
  }

  /**
   * A busy button or anchor swallows the click. A part's own host
   * listener runs before the caller's `(click)` on the same element, so
   * stopping it here keeps the caller's handler from running too.
   */
  protected onClick(event: Event): void {
    if (this.loading()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  /** An anchor has no `type`, and stamping one on it would be invalid HTML. */
  protected readonly typeAttribute = computed(() => (this.isAnchor ? null : this.type()));
}
