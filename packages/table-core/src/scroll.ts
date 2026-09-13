/**
 * Horizontal scroll: whether the viewport is hiding columns off its edges, and
 * where a "scroll right" press should land.
 *
 * A trackpad and a scrollbar are not the whole audience. A mouse without a
 * horizontal wheel, a touchpad-less desktop and a themed scrollbar that only
 * appears on hover all leave the same gap — the columns past the right edge are
 * reachable but not obviously *there*. Two buttons in the toolbar say they are.
 *
 * Kept here rather than in the adapter because none of it is React: the only
 * framework-shaped part is attaching the listener that re-reads the numbers.
 *
 * The arithmetic assumes a left-to-right viewport, as the rest of the table
 * does — pinned columns are positioned with physical `left`/`right` offsets, so
 * RTL is a table-wide piece of work rather than something this file can fix on
 * its own.
 */
import { MIN_COLUMN_WIDTH } from "./styles.js";

export interface HorizontalScrollPosition {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
}

export interface HorizontalScrollState {
  /** Content is wider than the viewport: there is something to scroll to. */
  overflowing: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

/**
 * Sub-pixel slack. Fractional column widths mean `scrollWidth` is routinely a
 * hair wider than `clientWidth` with nothing actually hidden, and browsers
 * report a `scrollLeft` a fraction short of the maximum at the very end of a
 * smooth scroll. Without the tolerance both show up as a button that is enabled
 * and does nothing.
 */
const EPSILON = 1;

/**
 * How much of the viewport one press moves, as a fraction of its width.
 *
 * Not a full page. The columns at the leading edge after the press are the ones
 * that were at the trailing edge before it, which is what makes the movement
 * readable as a scroll rather than as a jump to unrelated data — and a
 * left-pinned column covers part of the viewport, so a full-width step would
 * hide more than it revealed.
 */
const PAGE_FRACTION = 0.8;

export const NO_HORIZONTAL_SCROLL: HorizontalScrollState = {
  overflowing: false,
  canScrollLeft: false,
  canScrollRight: false,
};

export function horizontalScrollState(position: HorizontalScrollPosition): HorizontalScrollState {
  const max = maxScrollLeft(position);
  if (max <= EPSILON) return NO_HORIZONTAL_SCROLL;
  const left = clamp(position.scrollLeft, 0, max);
  return {
    overflowing: true,
    canScrollLeft: left > EPSILON,
    canScrollRight: left < max - EPSILON,
  };
}

/**
 * Where one press of a scroll button should land. A target rather than a delta,
 * so a press at either end is a no-op instead of a scroll into the clamp — and
 * so the adapter has nothing to decide.
 */
export function horizontalScrollTarget(
  position: HorizontalScrollPosition,
  direction: -1 | 1,
): number {
  const max = maxScrollLeft(position);
  // A narrow viewport still moves by a column's worth, so the buttons keep
  // working when the table is squeezed rather than nudging by a few pixels.
  const step = Math.max(position.clientWidth * PAGE_FRACTION, MIN_COLUMN_WIDTH);
  return clamp(position.scrollLeft + direction * step, 0, max);
}

function maxScrollLeft(position: HorizontalScrollPosition): number {
  return Math.max(0, position.scrollWidth - position.clientWidth);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
