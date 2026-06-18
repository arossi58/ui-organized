import type * as React from "react";
import type { DialogVariants } from "../Dialog/Dialog.styles.js";

export interface AlertDialogProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface AlertDialogTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the trigger onto a custom element. */
  render?: React.ReactElement;
}

export type AlertDialogTitleProps = React.ComponentPropsWithoutRef<"h2">;
export type AlertDialogDescriptionProps = React.ComponentPropsWithoutRef<"p">;
export type AlertDialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

export interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Width preset. Defaults to 'sm'. */
  size?: DialogVariants["size"];
  /** Render a close (×) button. Defaults to false — confirm with the actions. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}

export type AlertDialogCancelProps = Omit<React.ComponentPropsWithoutRef<"button">, "value">;

export interface AlertDialogConfirmProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Button intent. Defaults to 'primary'. Use 'destructive' for dangerous actions. */
  intent?: "primary" | "destructive";
}
