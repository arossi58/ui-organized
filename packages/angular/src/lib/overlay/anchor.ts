import type { ConnectedPosition } from "@angular/cdk/overlay";

/**
 * Where an anchored surface sits relative to its trigger, in the two spellings
 * the system uses.
 *
 * ── Two vocabularies, and why both are here ─────────────────────────────────
 *
 * The facade takes `side` + `align` — the pair Base UI used and the one every
 * component in this design system still exposes. Zag takes a single
 * *placement* (`"bottom-start"`), and Ark reflects the **resolved** one back
 * onto the trigger and the content as `data-placement` / `data-side`. Those two
 * attributes are part of the rendered contract the parity gate compares, so
 * Angular has to produce them from whatever the CDK actually chose.
 *
 * The CDK speaks a third vocabulary — four corner keywords per position — and
 * has no name for the result at all. It reports the `ConnectedPosition` object
 * it settled on, by identity. So each candidate is built here *paired with* the
 * placement name it stands for, and the resolved name is recovered by finding
 * the object in the list. Nothing is inferred from geometry, which is the only
 * way this stays correct when the CDK flips a surface for lack of room.
 */

export type OverlaySide = "top" | "right" | "bottom" | "left";
export type OverlayAlign = "start" | "center" | "end";
/** Zag's spelling: a bare side means centre-aligned. */
export type OverlayPlacement = OverlaySide | `${OverlaySide}-start` | `${OverlaySide}-end`;

export function toPlacement(side: OverlaySide, align: OverlayAlign): OverlayPlacement {
  return align === "center" ? side : (`${side}-${align}` as OverlayPlacement);
}

export function sideOf(placement: OverlayPlacement): OverlaySide {
  return placement.split("-")[0] as OverlaySide;
}

const OPPOSITE: Record<OverlaySide, OverlaySide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** A CDK position and the placement name it stands for. */
export interface AnchoredPosition {
  placement: OverlayPlacement;
  position: ConnectedPosition;
}

const isVertical = (side: OverlaySide) => side === "top" || side === "bottom";

/**
 * One candidate position.
 *
 * `sideOffset` is the gap along the axis the surface is on — zag calls it
 * `gutter` — and it flips sign with the side, because "8px below" and "8px
 * above" are opposite directions in the CDK's single offset. `alignOffset` runs
 * along the *cross* axis, so which of `offsetX`/`offsetY` it lands in swaps with
 * the orientation.
 */
function positionFor(
  side: OverlaySide,
  align: OverlayAlign,
  sideOffset: number,
  alignOffset: number,
): ConnectedPosition {
  if (isVertical(side)) {
    const x = align === "center" ? "center" : align;
    return {
      originX: x,
      originY: side === "bottom" ? "bottom" : "top",
      overlayX: x,
      overlayY: side === "bottom" ? "top" : "bottom",
      offsetY: side === "bottom" ? sideOffset : -sideOffset,
      offsetX: alignOffset,
    };
  }
  const y = align === "center" ? "center" : align === "start" ? "top" : "bottom";
  return {
    originX: side === "right" ? "end" : "start",
    originY: y,
    overlayX: side === "right" ? "start" : "end",
    overlayY: y,
    offsetX: side === "right" ? sideOffset : -sideOffset,
    offsetY: alignOffset,
  };
}

/**
 * The candidate list the CDK picks from, best first.
 *
 * The preferred placement, then the same alignment on the opposite side, then
 * the two perpendicular sides. That is floating-ui's `flip()` followed by its
 * fallback axis, which is what Ark runs — and it is not academic: the parity
 * harness renders its trigger at the top of the viewport, so a tooltip asking
 * for `top` has nowhere to go and Ark reports `data-placement="bottom"`. Without
 * a fallback here the CDK would leave the surface off-screen and Angular would
 * report a placement it never used.
 */
export function anchoredPositions(
  side: OverlaySide,
  align: OverlayAlign,
  sideOffset: number,
  alignOffset = 0,
): AnchoredPosition[] {
  const perpendicular: OverlaySide[] = isVertical(side) ? ["right", "left"] : ["bottom", "top"];
  return [side, OPPOSITE[side], ...perpendicular].map((candidate) => ({
    placement: toPlacement(candidate, align),
    position: positionFor(candidate, align, sideOffset, alignOffset),
  }));
}
