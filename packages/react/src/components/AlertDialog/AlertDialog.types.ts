import type * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui-components/react/alert-dialog";
import type { DialogVariants } from "../Dialog/Dialog.styles.js";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type AlertDialogProps = React.ComponentProps<typeof BaseAlertDialog.Root>;
export type AlertDialogTriggerProps = React.ComponentProps<typeof BaseAlertDialog.Trigger>;
export type AlertDialogTitleProps = Omit<
  React.ComponentProps<typeof BaseAlertDialog.Title>,
  "className"
> &
  StringClassName;
export type AlertDialogDescriptionProps = Omit<
  React.ComponentProps<typeof BaseAlertDialog.Description>,
  "className"
> &
  StringClassName;
export type AlertDialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

type PortalProps = React.ComponentProps<typeof BaseAlertDialog.Portal>;

export interface AlertDialogContentProps
  extends Omit<React.ComponentProps<typeof BaseAlertDialog.Popup>, "className">,
    StringClassName {
  /** Width preset. Defaults to 'sm'. */
  size?: DialogVariants["size"];
  /** Render a close (×) button. Defaults to false — confirm with the actions. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: PortalProps["container"];
}

export type AlertDialogCancelProps = Omit<
  React.ComponentProps<typeof BaseAlertDialog.Close>,
  "className"
> &
  StringClassName;

export interface AlertDialogConfirmProps
  extends Omit<React.ComponentProps<typeof BaseAlertDialog.Close>, "className">,
    StringClassName {
  /** Button intent. Defaults to 'primary'. Use 'destructive' for dangerous actions. */
  intent?: "primary" | "destructive";
}
