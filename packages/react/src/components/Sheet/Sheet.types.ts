import type * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import type { SheetVariants } from "./Sheet.styles.js";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type SheetProps = React.ComponentProps<typeof BaseDialog.Root>;
export type SheetTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>;
export type SheetCloseProps = React.ComponentProps<typeof BaseDialog.Close>;
export type SheetTitleProps = Omit<
  React.ComponentProps<typeof BaseDialog.Title>,
  "className"
> &
  StringClassName;
export type SheetDescriptionProps = Omit<
  React.ComponentProps<typeof BaseDialog.Description>,
  "className"
> &
  StringClassName;
export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>;

type PortalProps = React.ComponentProps<typeof BaseDialog.Portal>;

export interface SheetContentProps
  extends Omit<React.ComponentProps<typeof BaseDialog.Popup>, "className">,
    StringClassName {
  /** Edge the panel slides in from. Defaults to 'right'. */
  side?: SheetVariants["side"];
  /** Panel extent (width for left/right, height for top/bottom). Defaults to 'md'. */
  size?: SheetVariants["size"];
  /** Render a close (×) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: PortalProps["container"];
}
