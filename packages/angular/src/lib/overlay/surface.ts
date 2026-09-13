import type { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { applyOverlayStacking } from "./stacking.js";

/**
 * The CDK plumbing all five overlays share, and the three places the CDK's
 * defaults are wrong for this design system.
 *
 * ── 1. The pane's id ────────────────────────────────────────────────────────
 *
 * The CDK stamps `id="cdk-overlay-3"` on every pane it creates, for its own
 * debugging. No other library in this system renders that element at all — Ark
 * portals the positioner straight into `document.body` — and the parity gate
 * numbers **every id in the document in order** so that a reference can be
 * compared across four libraries that all generate different literals. One
 * extra id shifts every placeholder after it, and reports markup that is
 * identical as different. Nothing in the CDK reads the id back, so it goes.
 *
 * ── 2. The backdrop ─────────────────────────────────────────────────────────
 *
 * `hasBackdrop` gives a `.cdk-overlay-dark-backdrop`, which is a second dimming
 * layer over the `.dialog__backdrop` the shared stylesheet already defines.
 * Every surface here is created without one and renders its own where the
 * design calls for it.
 *
 * ── 3. The top layer ────────────────────────────────────────────────────────
 *
 * CDK 21 shows each overlay's host with `popover="manual"`, which puts it in the
 * browser's **top layer** — where stacking is by the order surfaces were shown
 * and `z-index` between them does not apply. Every surface here is attached when
 * its component initialises (Ark renders its portal whether the popup is open or
 * not, and a closed dialog is still laid out — see `UioDialog`), so show order
 * is *mount* order rather than *open* order, and a popover opened from inside a
 * dialog would sit under the dialog that has been showing since page load.
 * {@link raiseSurface} re-shows the host at the moment a surface opens, which is
 * the only lever the top layer offers.
 */
export function createSurface(overlay: Overlay, config: OverlayConfig): OverlayRef {
  const ref = overlay.create({ ...config, hasBackdrop: false });
  ref.overlayElement.removeAttribute("id");
  return ref;
}

/**
 * Give the pane, and the positioner inside it, the stacking level the popup's
 * own rule computed.
 *
 * Called after the portal is attached, never before: `applyOverlayStacking`
 * reads a *computed* style, which is only meaningful once the element is in the
 * document with the stylesheet applied.
 */
export function applySurfaceStacking(ref: OverlayRef): void {
  for (const positioner of ref.overlayElement.querySelectorAll<HTMLElement>(
    '[data-part="positioner"]',
  )) {
    applyOverlayStacking(ref.overlayElement, positioner);
  }
}

/**
 * Move an already-showing surface to the top of the browser's top layer.
 *
 * There is no API for reordering it: the position is fixed when the popover is
 * shown, so the only way up is to hide and show again. Guarded on
 * `:popover-open` because `showPopover()` on an element that is not showing is
 * fine, and `hidePopover()` on one that is not showing is a no-op — but the pair
 * is only *needed* when it is already up there.
 *
 * A no-op when the CDK is not using the popover API (an older browser, or
 * `usePopover: false`), where `z-index` governs and `UioOverlayStacking` has
 * already done the work.
 */
export function raiseSurface(ref: OverlayRef): void {
  const host = ref.hostElement as HTMLElement & {
    hidePopover?: () => void;
    showPopover?: () => void;
  };
  if (!host?.showPopover || !host.matches(":popover-open")) return;
  try {
    host.hidePopover();
    host.showPopover();
  } catch {
    // Both calls throw if the element left the document between them. A surface
    // that is gone does not need raising.
  }
}

/**
 * Whether the pane takes pointer events.
 *
 * A closed surface stays attached — Ark keeps its portal rendered — and
 * `.cdk-overlay-pane` is `pointer-events: auto`, so a closed dialog's
 * full-viewport positioner would swallow every click on the page. Zag writes the
 * same thing onto its positioner; this writes it one level up, on the element
 * the CDK owns.
 */
export function setSurfaceInteractive(ref: OverlayRef, interactive: boolean): void {
  ref.overlayElement.style.pointerEvents = interactive ? "" : "none";
}
