import { Dialog as ArkDialog, Portal } from "@ark-ui/react";
import { clsx } from "clsx";
import { sheetStyles } from "./Sheet.styles.js";
import { Icon } from "../Icon/index.js";
import type {
  SheetProps,
  SheetTriggerProps,
  SheetContentProps,
  SheetTitleProps,
  SheetDescriptionProps,
  SheetCloseProps,
  SheetFooterProps,
} from "./Sheet.types.js";
// Reuses the Dialog chrome (backdrop, title/description/footer/close).
import "../Dialog/Dialog.css";
import "./Sheet.css";

/** Sheet root — an edge-anchored panel built on the Dialog primitive. */
export function Sheet({ open, defaultOpen, onOpenChange, modal, children }: SheetProps) {
  return (
    <ArkDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
      modal={modal}
    >
      {children}
    </ArkDialog.Root>
  );
}

/** Element that opens the sheet. Pass `render` to project a custom element. */
export function SheetTrigger({ render, children, ...props }: SheetTriggerProps) {
  if (render) {
    return (
      <ArkDialog.Trigger asChild {...props}>
        {render}
      </ArkDialog.Trigger>
    );
  }
  return <ArkDialog.Trigger {...props}>{children}</ArkDialog.Trigger>;
}

/** Closes the sheet when activated. Pass `render` to project a custom element. */
export function SheetClose({ render, children, ...props }: SheetCloseProps) {
  if (render) {
    return (
      <ArkDialog.CloseTrigger asChild {...props}>
        {render}
      </ArkDialog.CloseTrigger>
    );
  }
  return <ArkDialog.CloseTrigger {...props}>{children}</ArkDialog.CloseTrigger>;
}

export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return <ArkDialog.Title className={clsx("dialog__title", "text-strong-heading-small", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return <ArkDialog.Description className={clsx("dialog__description", "text-default-body-medium", className)} {...props} />;
}

/** Right-aligned action row, typically holding the sheet's buttons. */
export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return <div className={clsx("dialog__footer", className)} {...props} />;
}

/** Portalled backdrop + edge-anchored panel holding the sheet body. The panel
 *  self-positions at the edge, so the positioner is just the Ark wrapper. */
export function SheetContent({
  side,
  size,
  showClose = true,
  container,
  className,
  children,
  ...contentProps
}: SheetContentProps) {
  return (
    <Portal container={container}>
      <ArkDialog.Backdrop className="dialog__backdrop" />
      <ArkDialog.Positioner className="dialog__positioner sheet__positioner">
        <ArkDialog.Content
          className={clsx(sheetStyles({ side, size }), className)}
          {...contentProps}
        >
          {showClose && (
            <ArkDialog.CloseTrigger className="dialog__close" aria-label="Close">
              <Icon name="close" size={20} />
            </ArkDialog.CloseTrigger>
          )}
          {children}
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </Portal>
  );
}
