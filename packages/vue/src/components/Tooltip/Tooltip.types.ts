import type { Component } from "vue";

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

export interface TooltipProps {
  /** Content shown in the tooltip bubble. A string, or a component. */
  content: string | Component;
  /** Side of the trigger to position against. Defaults to 'top'. */
  side?: TooltipSide;
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: TooltipAlign;
  /** Gap between the trigger and bubble, in px. Defaults to 6. */
  sideOffset?: number;
  /** Delay before opening, in ms. Falls back to a wrapping TooltipProvider. */
  delay?: number;
  /** Delay before closing, in ms. Falls back to a wrapping TooltipProvider. */
  closeDelay?: number;
  /** When true, renders the trigger without a tooltip. */
  disabled?: boolean;
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}

export interface TooltipProviderProps {
  /** Default delay before opening, in ms, for descendant tooltips. */
  delay?: number;
  /** Default delay before closing, in ms, for descendant tooltips. */
  closeDelay?: number;
}
