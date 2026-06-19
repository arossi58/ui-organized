import type * as React from "react";
import type { SheetVariants } from "./Sheet.styles.js";

export interface SheetProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Trap focus and block outside interaction while open. Defaults to true. */
  modal?: boolean;
  children?: React.ReactNode;
}

export interface SheetTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the trigger onto a custom element. */
  render?: React.ReactElement;
}

export interface SheetCloseProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the close control onto a custom element. */
  render?: React.ReactElement;
}

export type SheetTitleProps = React.ComponentPropsWithoutRef<"h2">;
export type SheetDescriptionProps = React.ComponentPropsWithoutRef<"p">;
export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>;

export interface SheetContentProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Edge the panel slides in from. Defaults to 'right'. */
  side?: SheetVariants["side"];
  /** Panel extent (width for left/right, height for top/bottom). Defaults to 'md'. */
  size?: SheetVariants["size"];
  /** Render a close (×) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}
