import { AfterViewInit, Directive, ElementRef, inject } from "@angular/core";

/**
 * Gives a CDK overlay the stacking level its own content declares.
 *
 * ── The problem ─────────────────────────────────────────────────────────────
 *
 * The shared stylesheet declares stacking on the **popup**, never on the thing
 * that positions it:
 *
 * ```css
 * .popover__popup { z-index: var(--z-index-popover, 1200); }
 * .dialog__popup  { z-index: var(--z-index-dialog,  1100); }
 * ```
 *
 * That is not a style choice, it is `@zag-js/popper`'s contract. Zag writes an
 * inline `z-index: var(--z-index)` onto the positioner and then fills that
 * variable by reading the popup back:
 *
 * ```js
 * floating.style.setProperty("--z-index", getComputedStyle(contentEl).zIndex)
 * ```
 *
 * So in the other three libraries the positioner inherits its level from the
 * popup, and a popover opened inside a dialog paints over it because 1200 beats
 * 1100. Getting that backwards is not subtle in effect and completely silent in
 * the code — the rule sits right there in devtools, applying to an element whose
 * stacking nobody consults.
 *
 * ── Why Angular needs its own answer ────────────────────────────────────────
 *
 * The CDK has no positioner. It parents every overlay to a single
 * `.cdk-overlay-container` and positions a `.cdk-overlay-pane` — which is the
 * element the browser actually stacks, and which knows nothing about what is
 * inside it. Every CDK pane therefore stacks identically, on DOM order alone,
 * and a select opened from inside a dialog renders *behind* its host.
 *
 * This reproduces zag's mechanism rather than replacing it: put the directive on
 * the popup, and the pane takes the level the popup's own rule computed. Nothing
 * is hardcoded, nothing is duplicated from the stylesheet, and a change to
 * `--z-index-popover` moves both this and React on the next render.
 *
 * Put it on the positioner; it finds the level wherever the stylesheet declares
 * it.
 *
 * ```html
 * <div class="popover__positioner" uioOverlayStacking>
 *   <div class="popover__popup">…</div>
 * </div>
 * ```
 *
 * The library's own five overlays call {@link applyOverlayStacking} directly
 * instead, through `applySurfaceStacking` — they already hold the `OverlayRef`,
 * and a directive would leave a `uiooverlaystacking` attribute in every
 * consumer's DOM for nothing. The directive is for anyone building their own CDK
 * overlay against this stylesheet.
 *
 * ── One thing it is *not* responsible for ───────────────────────────────────
 *
 * CDK 21 shows every overlay in the browser's **top layer** (`popover="manual"`),
 * where stacking is by the order surfaces were shown and `z-index` between them
 * does not apply at all. So in the common case — a popover opened from inside a
 * dialog — the popover is on top because it opened last, not because of this.
 * What this still governs is the pane's level against everything that is *not*
 * in the top layer, and it keeps the rendered contract honest: the same surfaces
 * carry the same levels they do in the other three libraries.
 */
export function applyOverlayStacking(pane: HTMLElement, positioner: HTMLElement): string | null {
  const view = pane.ownerDocument.defaultView;
  if (!view) return null;

  /**
   * Two shapes, one lookup — the same one zag does.
   *
   * A popper-positioned surface declares its level on the *popup*
   * (`.popover__popup`, `.select-popup`), because zag reads it back from
   * `positioner.firstElementChild`. A modal one is not popper-positioned at all
   * and declares it on the positioner itself (`.dialog__positioner`). Looking at
   * the positioner and then falling through to its first child covers both, and
   * means a component author places this in one place and never has to know
   * which kind of surface they are building.
   */
  const declared = [positioner, positioner.firstElementChild]
    .filter((element): element is HTMLElement => element instanceof view.HTMLElement)
    .map((element) => view.getComputedStyle(element).zIndex)
    .find((zIndex) => zIndex && zIndex !== "auto");

  // `auto` everywhere means no rule applies, and writing it onto the pane would
  // clear CDK's own value for no reason.
  if (!declared) return null;

  /**
   * Both elements, because they answer two different questions.
   *
   * The **pane** is what the browser stacks, so it is what makes a popover
   * actually paint over a dialog. The **positioner** is where the other three
   * libraries carry the level — zag writes an inline `z-index` onto it — and so
   * it is what anything comparing the four reads back. Writing only the pane
   * leaves `.select-positioner` computing `auto` where React reports 1200, and
   * the four would differ on the one property this exists to keep in step.
   *
   * Idempotent: a second run reads back the value it wrote and writes it again.
   */
  pane.style.zIndex = declared;
  positioner.style.zIndex = declared;
  return declared;
}

@Directive({ selector: "[uioOverlayStacking]", standalone: true })
export class UioOverlayStacking implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    const positioner = this.host.nativeElement;
    // After view init rather than on construction: the pane exists only once the
    // overlay has attached, and a computed style is only meaningful once the
    // element is in the document with the stylesheet applied.
    const pane = positioner.closest<HTMLElement>(".cdk-overlay-pane");
    if (pane) applyOverlayStacking(pane, positioner);
  }
}
