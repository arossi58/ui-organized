import type * as React from "react";

export type HoverCardSide = "top" | "right" | "bottom" | "left";
export type HoverCardAlign = "start" | "center" | "end";

export interface HoverCardProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Delay before opening on hover, in ms. */
  openDelay?: number;
  /** Delay before closing on leave, in ms. */
  closeDelay?: number;
  children?: React.ReactNode;
}

export interface HoverCardTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the trigger onto a custom element (e.g. a link). */
  render?: React.ReactElement;
}

export type HoverCardArrowProps = React.ComponentPropsWithoutRef<"div">;

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: HoverCardSide;
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: HoverCardAlign;
  /** Gap between trigger and card, in px. Defaults to 8. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** Render a pointer arrow toward the trigger. Defaults to false. */
  showArrow?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}
