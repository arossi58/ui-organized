/**
 * A bottom drawer's swipe-to-dismiss, as pure arithmetic. Ported from zag's
 * drawer (`@zag-js/drawer`, utils/session and utils/drawer-session), which
 * React, Svelte and Vue run through Ark; Angular has no zag, so its swipe
 * engine calls these instead and the four libraries agree on where a drag
 * ends up.
 *
 * Offsets are pixels below the drawer's resting position, so positive is
 * down, toward closed. Velocities are pixels per second, positive downward.
 * One resting position (zag's single snap point at 1, fully open), which is
 * the drawer this library ships.
 */

export const DRAWER_SWIPE = {
  /** The window of pointer samples the release velocity is measured over. */
  velocityWindowMs: 100,
  /** A last sample older than this at release means the pointer had stopped. */
  maxReleaseVelocityAgeMs: 80,
  /** The shortest gesture the whole-gesture average divides by. */
  minGestureMs: 50,
  /** Below this a release is placed, not flung. */
  snapVelocity: 400,
  /** How far a fling carries past where the pointer let go, per px/s. */
  snapVelocityMultiplier: 0.4,
  maxSnapVelocity: 4000,
  /** A displacement this large outranks a velocity pointing the other way. */
  displacementTrustPx: 24,
  /** Movement along the swipe axis before a press on the content counts as a drag. */
  dragStartPx: 6,
  /** ...and how much it must exceed movement across it. */
  dragStartRatio: 1.35,
  /** Swipe strength: the travel time at release speed that counts as slow. */
  strengthMaxDurationMs: 360,
  strengthMin: 0.1,
  strengthMax: 1,
} as const;

export interface DrawerSwipeSample {
  /** The pointer's clientY. */
  y: number;
  /** A timestamp in milliseconds, such as `performance.now()`. */
  time: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Where a drag from `startY` to `currentY` puts the drawer. Down follows the
 * pointer; up, past fully open, is rubber-banded to the square root of the
 * distance, so the drawer resists rather than detaching from the edge.
 */
export function drawerDragOffset(startY: number, currentY: number): number {
  const delta = startY - currentY;
  return delta > 0 ? -Math.sqrt(delta) : Math.abs(delta);
}

/**
 * The pointer's speed at release. Measured over the last
 * `velocityWindowMs` of samples while the pointer was still moving; if it
 * had stopped before letting go, the whole gesture's average instead.
 */
export function drawerReleaseVelocity(samples: readonly DrawerSwipeSample[], now: number): number {
  const newest = samples[samples.length - 1];
  if (!newest) return 0;
  const recent = samples.filter((s) => s.time >= newest.time - DRAWER_SWIPE.velocityWindowMs);
  const oldest = recent[0];
  if (recent.length >= 2 && oldest && now - newest.time <= DRAWER_SWIPE.maxReleaseVelocityAgeMs) {
    const dt = newest.time - oldest.time;
    return dt > 0 ? ((newest.y - oldest.y) / dt) * 1000 : 0;
  }
  const first = samples[0]!;
  if (samples.length < 2) return 0;
  const dt = Math.max(newest.time - first.time, DRAWER_SWIPE.minGestureMs);
  return ((newest.y - first.y) / dt) * 1000;
}

/** A velocity against a large displacement is the pointer settling, not a fling. */
function trustedVelocity(velocity: number, dragOffset: number): number {
  const opposed =
    Math.sign(velocity) !== 0 &&
    Math.sign(dragOffset) !== 0 &&
    Math.sign(velocity) !== Math.sign(dragOffset);
  return opposed && Math.abs(dragOffset) >= DRAWER_SWIPE.displacementTrustPx ? 0 : velocity;
}

/** Where a release would carry the drawer: past the pointer by a fling's momentum. */
function projectedOffset(dragOffset: number, velocity: number): number {
  const v = trustedVelocity(velocity, dragOffset);
  if (Math.abs(v) < DRAWER_SWIPE.snapVelocity) return dragOffset;
  const carried =
    dragOffset +
    clamp(v, -DRAWER_SWIPE.maxSnapVelocity, DRAWER_SWIPE.maxSnapVelocity) *
      DRAWER_SWIPE.snapVelocityMultiplier;
  return Math.max(0, carried);
}

/**
 * Whether a release closes the drawer: when, carried by its momentum, it
 * would come to rest nearer closed (`contentSize` down) than open (0).
 * Dragged past its own height, it is already closed.
 */
export function drawerShouldDismiss(
  dragOffset: number,
  velocity: number,
  contentSize: number,
): boolean {
  if (!(contentSize > 0)) return false;
  if (contentSize - dragOffset <= 0) return true;
  const target = projectedOffset(dragOffset, velocity);
  return Math.abs(target - contentSize) < Math.abs(target);
}

/**
 * How quickly the drawer finishes the move a release started, as a scale on
 * its animation's duration: the travel left at release speed, against
 * `strengthMaxDurationMs`. A fling finishes fast (0.1); a slow release, or
 * none, takes the full duration (1).
 */
export function drawerSwipeStrength(
  dragOffset: number,
  targetOffset: number,
  velocity: number,
): number {
  const distance = Math.abs(dragOffset - targetOffset);
  const speed = Math.abs(trustedVelocity(velocity, dragOffset));
  if (speed <= 0 || distance <= 0) return DRAWER_SWIPE.strengthMax;
  const normalized = clamp(((distance / speed) * 1000) / DRAWER_SWIPE.strengthMaxDurationMs, 0, 1);
  return (
    DRAWER_SWIPE.strengthMin + normalized * (DRAWER_SWIPE.strengthMax - DRAWER_SWIPE.strengthMin)
  );
}

/** How far through a dismissal the drag is, 0 to 1, for the backdrop's fade. */
export function drawerSwipeProgress(dragOffset: number, contentSize: number): number {
  return contentSize > 0 ? clamp(Math.abs(dragOffset) / contentSize, 0, 1) : 0;
}

/**
 * Whether a press on the content has become a drag. It has once the pointer
 * moves `dragStartPx` along the swipe axis, by clearly more than across it;
 * until then it may still be a click, a text selection or a sideways scroll.
 */
export function drawerDragStarted(dx: number, dy: number): boolean {
  const along = Math.abs(dy);
  return along >= DRAWER_SWIPE.dragStartPx && along >= Math.abs(dx) * DRAWER_SWIPE.dragStartRatio;
}
