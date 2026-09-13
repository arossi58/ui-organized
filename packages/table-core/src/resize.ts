/**
 * Column resizing, as arithmetic over normalized input.
 *
 * The pointer drag and the keyboard both land here, which is what keeps them
 * from drifting apart — the arrow keys are not an approximation of the drag,
 * they are the same function with a different delta.
 */
import { RESIZE_STEP, RESIZE_STEP_FINE } from "./styles.js";
import type { KeyEvent } from "./keyboard.js";

export interface ResizeBounds {
  width: number;
  min: number;
  max: number;
}

export function resizeStep(bounds: ResizeBounds, delta: number): number {
  const next = Math.round(bounds.width + delta);
  return Math.min(bounds.max, Math.max(bounds.min, next));
}

export type ResizeAction =
  | { type: "resize"; width: number }
  /** Enter/Home: back to the column's declared width. */
  | { type: "reset" }
  | { type: "none" };

/**
 * Keyboard resizing on the `role="separator"` handle. Shift is the fine-grained
 * modifier, matching how every other stepper in the system behaves.
 */
export function resizeKeyDown(bounds: ResizeBounds, event: KeyEvent): ResizeAction {
  const step = event.shift ? RESIZE_STEP_FINE : RESIZE_STEP;
  switch (event.key) {
    case "ArrowLeft":
      return { type: "resize", width: resizeStep(bounds, -step) };
    case "ArrowRight":
      return { type: "resize", width: resizeStep(bounds, step) };
    case "Home":
    case "Enter":
      return { type: "reset" };
    default:
      return { type: "none" };
  }
}

/** Move a column in `columnOrder`, for the menu's "Move left" / "Move right". */
export function moveColumn(
  order: readonly string[],
  columnId: string,
  direction: -1 | 1,
): string[] {
  const from = order.indexOf(columnId);
  if (from === -1) return [...order];
  const to = from + direction;
  if (to < 0 || to >= order.length) return [...order];
  const next = [...order];
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
}
