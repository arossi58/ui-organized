import type { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from "@angular/cdk/overlay";
import { signal, type WritableSignal } from "@angular/core";
import type { Subscription } from "rxjs";
import type { AnchoredPosition, OverlayPlacement } from "./anchor.js";
import { sideOf } from "./anchor.js";
import { createSurface } from "./surface.js";

/**
 * A surface pinned to a trigger, and the one thing the CDK will not tell you:
 * *which* placement it settled on.
 *
 * Ark reflects the resolved placement onto both the trigger and the content
 * (`data-placement`, `data-side`), and the parity gate compares them — they are
 * how a flip is observable at all. The CDK reports the `ConnectedPosition` object
 * it chose, by identity, and has no name for it. So the candidate list is built
 * with its names attached (see `anchor.ts`) and the name is recovered by finding
 * the object. Nothing is derived from geometry, which is what keeps this honest
 * when the surface flips for lack of room.
 *
 * Both attributes are **sticky**: once a surface has been positioned they stay
 * on the trigger and the content after it closes, exactly as Ark leaves them.
 * That is why `placement` starts as `null` rather than as the requested side —
 * a popover that has never been opened carries neither attribute in any library.
 */
export class AnchoredSurface {
  /** `null` until the surface has actually been placed. */
  readonly placement: WritableSignal<OverlayPlacement | null> = signal(null);

  private ref?: OverlayRef;
  private strategy?: FlexibleConnectedPositionStrategy;
  private candidates: AnchoredPosition[] = [];
  private changes?: Subscription;
  /**
   * The placement the CDK has chosen, held back until the surface is first
   * opened.
   *
   * The overlay is attached while closed, so the CDK positions it immediately
   * and would report a placement for a surface that has never been shown. Ark
   * reports none — `data-placement` appears on a trigger the first time its
   * popup opens and is sticky from then on — and a trigger claiming a side
   * before anything has been placed is a difference a user could see, because
   * the stylesheet can select on it.
   */
  private latest: OverlayPlacement | null = null;
  private positioned = false;

  constructor(private readonly overlay: Overlay) {}

  get overlayRef(): OverlayRef | undefined {
    return this.ref;
  }

  /** The side half of the resolved placement, which Ark emits separately. */
  side(): string | null {
    const placement = this.placement();
    return placement ? sideOf(placement) : null;
  }

  create(anchor: HTMLElement, candidates: AnchoredPosition[]): OverlayRef {
    this.candidates = candidates;
    this.strategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions(candidates.map((candidate) => candidate.position))
      /**
       * Push, but do not shrink. `withPush` nudges a surface back inside the
       * viewport, which is floating-ui's `shift()` and what Ark does.
       * `withFlexibleDimensions` instead makes the surface *narrower* to fit,
       * which no other library in this system does and which would silently
       * reflow a menu's items.
       */
      .withFlexibleDimensions(false)
      .withPush(true)
      .withGrowAfterOpen(true);

    this.changes = this.strategy.positionChanges.subscribe((change) => {
      const match = this.candidates.find(
        (candidate) => candidate.position === change.connectionPair,
      );
      if (!match) return;
      this.latest = match.placement;
      if (this.positioned) this.placement.set(this.latest);
    });

    this.ref = createSurface(this.overlay, {
      positionStrategy: this.strategy,
      // Reposition rather than block: an anchored surface follows its trigger,
      // and the trigger is part of the page the user is still scrolling.
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    return this.ref;
  }

  /**
   * Re-point the surface at a different element.
   *
   * The overlay is created when the component initialises, which is before a
   * trigger declared *after* it in the template has had a chance to introduce
   * itself. Creating against a placeholder and re-anchoring costs one call and
   * removes an ordering rule nobody would remember.
   */
  setAnchor(anchor: HTMLElement): void {
    this.strategy?.setOrigin(anchor);
    if (this.ref?.hasAttached()) this.ref.updatePosition();
  }

  /** Called when `side`, `align` or either offset changes. */
  setCandidates(candidates: AnchoredPosition[]): void {
    this.candidates = candidates;
    if (!this.strategy) return;
    this.strategy.withPositions(candidates.map((candidate) => candidate.position));
    if (this.ref?.hasAttached()) this.ref.updatePosition();
  }

  /**
   * Re-measure, which an always-attached surface needs on every open.
   *
   * The CDK positions on attach, and this attaches while closed — at which
   * point the popup is `hidden`, has no size, and lands wherever a zero-height
   * box would go.
   */
  reposition(): void {
    this.positioned = true;
    this.ref?.updatePosition();
    // Published even when `updatePosition` had nothing to say: the CDK only
    // emits when the chosen position *changes*, and the very first open usually
    // keeps the one picked at attach time.
    this.placement.set(this.latest);
  }

  dispose(): void {
    this.changes?.unsubscribe();
    this.ref?.dispose();
  }
}
