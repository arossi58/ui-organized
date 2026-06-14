/**
 * Pure scroll-stage math — no React, no matter-js. Maps the stage scroll
 * progress P ∈ [0,1] to phases, per-piece assembly easing, and overlay
 * transforms. Every magic constant from the prototype lives here in one
 * config object so the engine reads, never hard-codes, them (SITE.md §5).
 */

export const STAGE = {
  /** Scroll track height as a multiple of the viewport. Mirrors the
   * `.hero-stage` height in hero-stage.css — keep the two in sync. */
  trackVh: 360,
  /** P below this is the pure-physics phase (pieces still falling). */
  physicsEnd: 0.12,
  /** P at/after this the layout is organized → "edit mode" (pieces draggable).
   * Pulled earlier (was 0.965) so edit mode arrives well before the track ends,
   * leaving room to scroll past it; the assembly span/stagger below are
   * compressed to match so every piece is home by here. A soft scroll-snap
   * (`.hero-stage__snap`) marks this point. */
  organizedAt: 0.71,
  /** Fraction of post-physics progress a single piece spends assembling. */
  assemblySpan: 0.35,
  /** Largest stagger offset across pieces (first→last assembly start). */
  staggerWindow: 0.32,
  /** Spawn choreography (ms). */
  spawnBeatMs: 350,
  spawnIntervalMs: 140,
  spawnJitterMs: 60,
} as const;

/** Arrange-mode spring (SITE.md §5): how a dropped piece eases from where it
 * was released back onto its snapped home slot. Ported from the prototype. */
export const ARRANGE = {
  /** Pull toward the home slot per frame (spring stiffness). */
  springPull: 0.18,
  /** Velocity retained per frame (damping). */
  springDamp: 0.7,
  /** Settle when within this many px of home… */
  settlePos: 0.4,
  /** …and below this px/frame speed. */
  settleVel: 0.05,
  /** Pointer travel (px) before a press becomes a drag rather than a click —
   * below this, the press passes through so the real component handles it. */
  dragThresholdPx: 5,
  /** Master switch for arrange-mode dragging. When false, the organized mockup
   * stays put — pieces are still live (clickable/typable), just not draggable.
   * All the drag machinery is left intact; flip this to re-enable it. */
  dragEnabled: false,
} as const;

/** Overlay (title / frame / caption) mapping constants, ported verbatim. */
export const OVERLAY = {
  titleTuckEnd: 0.3, // P at which the title finishes tucking
  titleRise: 0.37, // × viewport height — lifts the (now full-size) title clear of
  // the assembling frame so it sits above with an even gap (the frame is centered
  // in the band between the tucked title and the caption, see engine measure()).
  titleShrink: 0, // headings stay full size: the tucked hero title matches the
  // end-caption heading exactly, no scale-down (feedback).
  titleFadeEnd: 0.1, // eyebrow + hint fully faded by here
  frameStart: 0.22,
  frameSpan: 0.28,
  frameRise: 26, // px the frame lifts in from
  frameScaleFrom: 0.96,
  captionStart: 0.6, // in by ~0.7, so the CTA is up when edit mode snaps (0.71)
  captionSpan: 0.1,
  captionRise: 18, // px
  captionInteractiveAt: 0.6, // caption local-progress past which it accepts clicks
} as const;

export type StagePhase = "physics" | "assembling" | "organized";

export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** Cubic ease-in-out (prototype's easeInOut). */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function phaseFor(P: number): StagePhase {
  if (P < STAGE.physicsEnd) return "physics";
  if (P >= STAGE.organizedAt) return "organized";
  return "assembling";
}

/**
 * Eased assembly progress (0→1) for a single piece, given its stagger start
 * `t0` ∈ [0, staggerWindow]. 0 = still at its captured physics pose, 1 = home.
 */
export function pieceAssembly(P: number, t0: number): number {
  const { physicsEnd, assemblySpan } = STAGE;
  const local = clamp01(
    (P - physicsEnd - t0 * (1 - physicsEnd)) / (assemblySpan * (1 - physicsEnd)),
  );
  return easeInOut(local);
}

/** Stagger start for piece `i` of `count` total. */
export function staggerStart(i: number, count: number): number {
  return (i / count) * STAGE.staggerWindow;
}

/** Title tuck progress 0→1 (drives translateY + scale). */
export function titleTuck(P: number): number {
  return easeInOut(clamp01(P / OVERLAY.titleTuckEnd));
}

/** Opacity for the eyebrow + scroll hint (fade out early). */
export function titleHintFade(P: number): number {
  return 1 - clamp01(P / OVERLAY.titleFadeEnd);
}

/** App-frame reveal progress 0→1. */
export function frameReveal(P: number): number {
  return easeInOut(clamp01((P - OVERLAY.frameStart) / OVERLAY.frameSpan));
}

/** End-caption reveal progress 0→1. */
export function captionReveal(P: number): number {
  return clamp01((P - OVERLAY.captionStart) / OVERLAY.captionSpan);
}

/** Compute P from a stage track element relative to the viewport. */
export function progressFor(stageEl: HTMLElement, viewportH: number): number {
  const rect = stageEl.getBoundingClientRect();
  const total = stageEl.offsetHeight - viewportH;
  return total > 0 ? clamp01(-rect.top / total) : 0;
}
