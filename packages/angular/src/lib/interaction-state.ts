import { Directive, signal, type Signal } from "@angular/core";

/**
 * Hover and focus, reported the way the shared stylesheets read them.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `Checkbox.css`, `Radio.css`, `Switch.css` and `SegmentedControl.css` all draw
 * their focus ring from `[data-focus-visible]`, because the element that takes
 * the focus is a visually-hidden `<input>` and the element that shows it is a
 * `<span>` beside it — so `:focus-visible` on the control itself never matches
 * and the attribute is the only way across.
 *
 * Zag emits it in the other three libraries. Angular has no Zag, so three
 * controls emitted nothing and **drew no focus ring at all** for keyboard users.
 * Nothing caught it: the a11y gate is React-only, and every Checkbox parity
 * scenario was static — nobody had ever compared one that had been touched.
 * A `Checkbox` scenario that clicks is what finally failed.
 *
 * ── Why a host directive ────────────────────────────────────────────────────
 *
 * The three components already extend `UioPart`, which is the obvious place to
 * put this — and the wrong one: `UioPart` is the base for every part in the
 * package, and four DOM listeners on all of them to serve three is a real cost
 * for no benefit. `hostDirectives` composes it onto exactly the parts that need
 * it, and a part that adds it is declaring "I am something you can point at".
 *
 * ── `focusin`, not `focus` ──────────────────────────────────────────────────
 *
 * The focus lands on a descendant — the hidden input — and `focus` does not
 * bubble. `focusin` does, which is what lets one listener on the root see it.
 *
 * `:focus-visible` is asked of the browser rather than reimplemented. Zag ships
 * a heuristic because it has to work in engines that lacked the pseudo-class;
 * this package targets Angular 21, where it is everywhere, and the native answer
 * is the one the user's own settings feed into.
 */
@Directive({
  standalone: true,
  host: {
    "(mouseenter)": "hovering.set(true)",
    "(mouseleave)": "hovering.set(false)",
    "(focusin)": "onFocusIn($event)",
    "(focusout)": "onFocusOut()",
  },
})
export class UioInteractionState {
  protected readonly hovering = signal(false);
  private readonly focused = signal(false);
  private readonly focusedVisible = signal(false);

  readonly hover: Signal<boolean> = this.hovering.asReadonly();
  readonly focus: Signal<boolean> = this.focused.asReadonly();
  readonly focusVisible: Signal<boolean> = this.focusedVisible.asReadonly();

  protected onFocusIn(event: FocusEvent): void {
    this.focused.set(true);
    const target = event.target as Element | null;
    // Guarded: `matches` throws on an unsupported selector in older engines, and
    // a control that reports no focus ring is better than one that throws.
    try {
      this.focusedVisible.set(!!target?.matches(":focus-visible"));
    } catch {
      this.focusedVisible.set(false);
    }
  }

  protected onFocusOut(): void {
    this.focused.set(false);
    this.focusedVisible.set(false);
  }
}
