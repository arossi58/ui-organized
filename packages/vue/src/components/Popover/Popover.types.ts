export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Trap focus and block outside interaction while open. */
  modal?: boolean;
}

export interface PopoverContentProps {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: PopoverSide;
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: PopoverAlign;
  /** Gap between trigger and popup, in px. Defaults to 8. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}
