import type * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type DialogProps = React.ComponentProps<typeof BaseDialog.Root>;
export type DialogTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>;
export type DialogCloseProps = React.ComponentProps<typeof BaseDialog.Close>;
export type DialogTitleProps = Omit<
  React.ComponentProps<typeof BaseDialog.Title>,
  "className"
> &
  StringClassName;
export type DialogDescriptionProps = Omit<
  React.ComponentProps<typeof BaseDialog.Description>,
  "className"
> &
  StringClassName;
export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

type PortalProps = React.ComponentProps<typeof BaseDialog.Portal>;

export interface DialogContentProps
  extends Omit<React.ComponentProps<typeof BaseDialog.Popup>, "className">,
    StringClassName {
  /** Width preset. Defaults to 'md'. */
  size?: "sm" | "md" | "lg" | "fullscreen";
  /** Render a close (×) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: PortalProps["container"];
}
