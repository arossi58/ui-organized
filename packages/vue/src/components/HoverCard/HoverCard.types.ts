export type HoverCardSide = "top" | "right" | "bottom" | "left";
export type HoverCardAlign = "start" | "center" | "end";

export interface HoverCardProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Delay before opening on hover, in ms. */
  openDelay?: number;
  /** Delay before closing on leave, in ms. */
  closeDelay?: number;
}

export interface HoverCardContentProps {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: HoverCardSide;
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: HoverCardAlign;
  /** Gap between trigger and card, in px. Defaults to 8. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}
