import type { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from "@angular/cdk/overlay";
import { signal, type WritableSignal } from "@angular/core";
import type { Subscription } from "rxjs";
import type { AnchoredPosition, OverlayPlacement } from "../overlay/anchor.js";
import { sideOf } from "../overlay/anchor.js";
import { createSurface } from "../overlay/surface.js";

/** Where a right-click landed, in viewport coordinates. */
export interface AnchorPoint {
  x: number;
  y: number;
}

/**
 * `AnchoredSurface`'s sibling, for a surface pinned to a **cursor** rather than
 * to a trigger.
 *
 * ── Why this is not `AnchoredSurface` with a different argument ─────────────
 *
 * Two reasons, and the second is the one that shows up in a DOM diff.
 *
 * The CDK anchors a `FlexibleConnectedPositionStrategy` to an element *or* to a
 * point — `flexibleConnectedTo` takes both — but `AnchoredSurface` narrows the
 * type to `HTMLElement`, because every other overlay in this library hangs off
 * a trigger it can point at. A context menu has no such element: the trigger is
 * an area, and the menu appears where the pointer was.
 *
 * More importantly, a context menu that has never been right-clicked has **no
 * placement at all**. Zag positions this surface against a virtual element at
 * `anchorPoint`, so a menu opened declaratively (`[open]="true"`, no pointer)
 * is never measured and reports neither `data-placement` nor `data-side` — the
 * parity gate's own `defaultOpen` case shows React emitting neither. The CDK
 * would happily position against *something* and report a side the menu never
 * used, so placement here is published only once a point has been given.
 *
 * Everything else — the candidate list, how a resolved placement is recovered
 * from the object the CDK chose rather than guessed from geometry — is the same
 * mechanism, imported from the same place.
 *
 * ── One difference, measured and deliberately not reproduced ────────────────
 *
 * Ark's context menu lands **4px to the left** of the pointer; this one lands on
 * it. The 4px is `@zag-js/popper`'s `arrowPadding`, and it applies even though
 * no arrow is rendered: `getArrowMiddleware` installs floating-ui's `arrow()`
 * unconditionally, handing it a throwaway `<div>` when there is none, and
 * against a zero-size anchor that padding pushes the surface a whole
 * `arrowPadding` along the cross axis. It is constant — four pixels whatever
 * `sideOffset` is — and it is an artefact of a middleware that is otherwise
 * doing nothing. The CDK has no arrow middleware to reproduce it with, and the
 * DOM contract compares attributes rather than geometry, so the two differ by
 * four pixels here and agree on everything the gate reads.
 */
export class PointerSurface {
  /** `null` until a pointer has actually placed the surface. */
  readonly placement: WritableSignal<OverlayPlacement | null> = signal(null);

  private ref?: OverlayRef;
  private strategy?: FlexibleConnectedPositionStrategy;
  private candidates: AnchoredPosition[] = [];
  private changes?: Subscription;
  private latest: OverlayPlacement | null = null;
  private point: AnchorPoint | null = null;

  constructor(private readonly overlay: Overlay) {}

  get overlayRef(): OverlayRef | undefined {
    return this.ref;
  }

  /** Whether a right-click has ever placed this surface. */
  get anchored(): boolean {
    return this.point !== null;
  }

  /**
   * Where the surface was last placed, or `null`.
   *
   * Exposed because it is the only way to check *where* a context menu went
   * without a layout engine: jsdom measures every element as zero, so the CDK
   * has nothing to position against and a spec asserting coordinates would be
   * asserting zeroes. This is the input to that positioning, and it is what a
   * wrong pointer handler gets wrong.
   */
  get anchorPoint(): AnchorPoint | null {
    return this.point;
  }

  /** The side half of the resolved placement, which Ark emits separately. */
  side(): string | null {
    const placement = this.placement();
    return placement ? sideOf(placement) : null;
  }

  create(candidates: AnchoredPosition[]): OverlayRef {
    this.candidates = candidates;
    this.strategy = this.overlay
      .position()
      // A zero-size origin: the cursor is a point, and giving it width would
      // offset the menu by half a phantom box. Replaced on every right-click.
      .flexibleConnectedTo({ x: 0, y: 0, width: 0, height: 0 })
      .withPositions(candidates.map((candidate) => candidate.position))
      // Push, but do not shrink — see `AnchoredSurface` for why narrowing a
      // menu to fit is the wrong kind of accommodation.
      .withFlexibleDimensions(false)
      .withPush(true)
      .withGrowAfterOpen(true);

    this.changes = this.strategy.positionChanges.subscribe((change) => {
      const match = this.candidates.find((candidate) => candidate.position === change.connectionPair);
      if (!match) return;
      this.latest = match.placement;
      if (this.point) this.placement.set(this.latest);
    });

    this.ref = createSurface(this.overlay, {
      positionStrategy: this.strategy,
      // Reposition rather than block: the menu belongs to a point in the page,
      // and the page is still the user's to scroll.
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    return this.ref;
  }

  /** Called when `sideOffset` or `alignOffset` changes. */
  setCandidates(candidates: AnchoredPosition[]): void {
    this.candidates = candidates;
    if (!this.strategy) return;
    this.strategy.withPositions(candidates.map((candidate) => candidate.position));
    if (this.point && this.ref?.hasAttached()) this.ref.updatePosition();
  }

  /**
   * Put the surface where the pointer was, and start reporting a placement.
   *
   * Called after the popup has been refreshed for the open state, never before:
   * a `hidden` popup has no height, and the CDK picks a candidate by asking
   * which one fits.
   */
  placeAt(point: AnchorPoint): void {
    this.point = point;
    this.strategy?.setOrigin({ ...point, width: 0, height: 0 });
    this.ref?.updatePosition();
    // Published even when `updatePosition` had nothing to say: the CDK only
    // emits when the chosen position *changes*.
    this.placement.set(this.latest);
  }

  dispose(): void {
    this.changes?.unsubscribe();
    this.ref?.dispose();
  }
}
