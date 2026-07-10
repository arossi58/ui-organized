import type * as React from "react";

/** Side of the trigger to position the tooltip against. */
export type TooltipSide = "top" | "right" | "bottom" | "left";
/** Alignment along the chosen side. */
export type TooltipAlign = "start" | "center" | "end";

export interface TooltipProps {
  /** Content shown in the tooltip bubble. */
  content: React.ReactNode;
  /** The trigger. A single element is projected as the trigger; other nodes are wrapped. */
  children: React.ReactNode;
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
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}

/**
 * App-level provider that shares open/close delays across the tooltips it wraps.
 * Hand-authored facade type (was derived from Base UI's Tooltip.Provider); Ark UI
 * has no shared-delay provider, so the facade supplies defaults via React context.
 */
export interface TooltipProviderProps {
  children: React.ReactNode;
  /** Default delay before opening, in ms, for descendant tooltips. */
  delay?: number;
  /** Default delay before closing, in ms, for descendant tooltips. */
  closeDelay?: number;
}
