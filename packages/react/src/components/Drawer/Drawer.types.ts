import type * as React from "react";

export interface DrawerProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes, including a swipe that closes it. */
  onOpenChange?: (open: boolean) => void;
  /** Trap focus and block outside interaction while open. Defaults to true. */
  modal?: boolean;
  children?: React.ReactNode;
}

export interface DrawerTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value"
> {
  /** Project the trigger onto a custom element. */
  render?: React.ReactElement;
}

export interface DrawerCloseProps extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the close control onto a custom element. */
  render?: React.ReactElement;
}

export type DrawerTitleProps = React.ComponentPropsWithoutRef<"h2">;
export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<"div">;
export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>;

export interface DrawerContentProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "draggable"
> {
  /**
   * Whether a press on the content can drag the panel, once it moves clearly
   * downward. Defaults to true. The grabber always drags.
   */
  draggable?: boolean;
  /** The handle along the top edge, which always drags. Defaults to true. */
  showGrabber?: boolean;
  /** A close (×) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}
