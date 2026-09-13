/**
 * Virtualization arithmetic.
 *
 * The interesting decisions — when to virtualize at all, how tall the spacers
 * are, when the viewport is close enough to the end to ask for more rows — are
 * all framework-free. Each adapter only has to own attaching the observer.
 */
import type { VirtualItem } from "@tanstack/virtual-core";
import { OVERSCAN, ROW_HEIGHT, VIRTUAL_THRESHOLD } from "./styles.js";
import type { TableSize } from "./types.js";

export interface VirtualConfig {
  /** Row count above which virtualization pays for itself. */
  threshold?: number;
  /** Rows rendered beyond each edge of the viewport. */
  overscan?: number;
}

export function shouldVirtualize(
  rowCount: number,
  enabled: boolean | VirtualConfig | undefined,
): boolean {
  if (enabled === false) return false;
  const threshold =
    typeof enabled === "object" ? (enabled.threshold ?? VIRTUAL_THRESHOLD) : VIRTUAL_THRESHOLD;
  return rowCount > threshold;
}

export function overscanFor(enabled: boolean | VirtualConfig | undefined): number {
  return typeof enabled === "object" ? (enabled.overscan ?? OVERSCAN) : OVERSCAN;
}

/**
 * The two spacer heights.
 *
 * Everything above the window becomes one tall empty row and everything below
 * becomes another, which is what lets the rendered rows stay real `<tr>`s in a
 * real `<tbody>` — and therefore keeps the implicit table semantics that a
 * `display: grid` table throws away.
 */
export function spacerHeights(
  items: readonly VirtualItem[],
  totalSize: number,
): { top: number; bottom: number } {
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return { top: 0, bottom: 0 };
  return {
    top: first.start,
    bottom: Math.max(0, totalSize - last.end),
  };
}

/** The initial row-height estimate. Every rendered row is measured afterwards. */
export function estimateRowHeight(size: TableSize): number {
  return ROW_HEIGHT[size];
}

export interface ScrollPosition {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

/**
 * Infinite scroll: is the viewport close enough to the end to ask for the next
 * page? Measured in rows rather than pixels so it behaves the same at every
 * size, and so a `lg` table does not fetch later than an `sm` one.
 */
export function isNearEnd(position: ScrollPosition, rowHeight: number, rowsFromEnd = 10): boolean {
  const remaining = position.scrollHeight - position.scrollTop - position.clientHeight;
  return remaining < rowHeight * rowsFromEnd;
}
