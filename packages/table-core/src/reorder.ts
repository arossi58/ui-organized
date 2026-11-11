/**
 * Column reordering: which columns move, and where a move puts them.
 *
 * Pure order arithmetic over TanStack's `columnOrder`, so the four adapters
 * share one answer to "what is to the left of this column" — the question every
 * button, drop and shortcut asks. The adapters own the gestures; this owns the
 * outcome.
 *
 * Two kinds of column never move. The table's own (selection, row actions)
 * hold the edges they were designed for. Pinned columns are placed by pinning,
 * not by order: TanStack renders them at their edge whatever `columnOrder`
 * says, so moving one would change state with nothing on screen to show for it.
 */
import { isReservedColumn } from "./columns.js";

/**
 * - `true` / `"always"`: headers can be dragged, and their move buttons appear
 *   on hover and focus, at any time.
 * - `"toggle"`: the same, but only inside a reorder mode the user enters from
 *   the toolbar. For tables whose headers are busy enough that a stray drag
 *   would surprise.
 */
export type ReorderSetting = boolean | "always" | "toggle";

export type ReorderMode = "off" | "always" | "toggle";

export function reorderModeOf(setting: ReorderSetting | undefined): ReorderMode {
  if (setting === "toggle") return "toggle";
  return setting === true || setting === "always" ? "always" : "off";
}

/** Which side of the target a dragged column lands on. */
export type DropSide = "before" | "after";

/**
 * The full order as it stands. TanStack's `columnOrder` starts empty (meaning
 * "definition order") and can miss columns added since it was written, so
 * every move starts from this rather than from the raw state.
 */
export function currentColumnOrder(
  columnOrder: readonly string[],
  allIds: readonly string[],
): string[] {
  const known = new Set(allIds);
  const ordered = columnOrder.filter((id) => known.has(id));
  const placed = new Set(ordered);
  return [...ordered, ...allIds.filter((id) => !placed.has(id))];
}

/** Not the table's own column, and not pinned. */
export function isMovableColumn(id: string, pinned: boolean): boolean {
  return !isReservedColumn(id) && !pinned;
}

function neighbour(
  order: readonly string[],
  from: number,
  direction: -1 | 1,
  movable: (id: string) => boolean,
): number {
  for (let index = from + direction; index >= 0 && index < order.length; index += direction) {
    if (movable(order[index]!)) return index;
  }
  return -1;
}

/**
 * Whether the column can step `direction`: there is a movable column on that
 * side to trade places with. Hidden columns are skipped by passing a `movable`
 * that excludes them, so a step is always a step the user can see.
 */
export function canStepColumn(
  order: readonly string[],
  columnId: string,
  direction: -1 | 1,
  movable: (id: string) => boolean,
): boolean {
  const from = order.indexOf(columnId);
  return from !== -1 && movable(columnId) && neighbour(order, from, direction, movable) !== -1;
}

/**
 * One step left or right, past the nearest movable column — the move the
 * header's arrow buttons and the Alt+Arrow shortcut make. A no-op returns a
 * copy of the same order.
 */
export function stepColumn(
  order: readonly string[],
  columnId: string,
  direction: -1 | 1,
  movable: (id: string) => boolean,
): string[] {
  const from = order.indexOf(columnId);
  if (from === -1 || !movable(columnId)) return [...order];
  const to = neighbour(order, from, direction, movable);
  if (to === -1) return [...order];
  const next = [...order];
  next.splice(from, 1);
  next.splice(to, 0, columnId);
  return next;
}

/** A dragged column dropped beside another. */
export function dropColumn(
  order: readonly string[],
  sourceId: string,
  targetId: string,
  side: DropSide,
): string[] {
  if (sourceId === targetId || !order.includes(sourceId) || !order.includes(targetId)) {
    return [...order];
  }
  const next = order.filter((id) => id !== sourceId);
  const at = next.indexOf(targetId) + (side === "after" ? 1 : 0);
  next.splice(at, 0, sourceId);
  return next;
}

/** Left half of the target lands before it, right half after. */
export function dropSideAt(clientX: number, rect: { left: number; width: number }): DropSide {
  return clientX < rect.left + rect.width / 2 ? "before" : "after";
}
