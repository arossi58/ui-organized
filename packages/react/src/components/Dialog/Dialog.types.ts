import type * as React from "react";

export interface DialogProps {
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

export interface DialogTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the trigger onto a custom element. */
  render?: React.ReactElement;
}

export interface DialogCloseProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the close control onto a custom element. */
  render?: React.ReactElement;
}

export type DialogTitleProps = React.ComponentPropsWithoutRef<"h2">;
export type DialogDescriptionProps = React.ComponentPropsWithoutRef<"p">;
export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

export interface DialogContentProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Width preset. Defaults to 'md'. */
  size?: "sm" | "md" | "lg" | "fullscreen";
  /** Render a close (×) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}
