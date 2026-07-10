import type * as React from "react";

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Trap focus and block outside interaction while open. */
  modal?: boolean;
  children?: React.ReactNode;
}

export interface PopoverTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the trigger onto a custom element instead of rendering a button. */
  render?: React.ReactElement;
}

export interface PopoverCloseProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the close control onto a custom element. */
  render?: React.ReactElement;
}

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: PopoverSide;
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: PopoverAlign;
  /** Gap between trigger and popup, in px. Defaults to 8. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}
