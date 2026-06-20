import { Dialog as ArkDialog, Portal } from "@ark-ui/react";
import { clsx } from "clsx";
import { dialogStyles } from "../Dialog/Dialog.styles.js";
import { buttonStyles } from "../Button/Button.styles.js";
import { Icon } from "../Icon/index.js";
import type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogContentProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogFooterProps,
  AlertDialogCancelProps,
  AlertDialogConfirmProps,
} from "./AlertDialog.types.js";
// Reuses the Dialog chrome (backdrop, popup sizing, title/description/footer/close).
import "../Dialog/Dialog.css";

/** AlertDialog root — a focus-trapping confirm dialog dismissed via its actions. */
export function AlertDialog({ open, defaultOpen, onOpenChange, children }: AlertDialogProps) {
  // role="alertdialog" gives it the alert semantics + no outside-click dismiss.
  return (
    <ArkDialog.Root
      role="alertdialog"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
    >
      {children}
    </ArkDialog.Root>
  );
}

/** Element that opens the dialog. Pass `render` to project a custom element. */
export function AlertDialogTrigger({ render, children, ...props }: AlertDialogTriggerProps) {
  if (render) {
    return (
      <ArkDialog.Trigger asChild {...props}>
        {render}
      </ArkDialog.Trigger>
    );
  }
  return <ArkDialog.Trigger {...props}>{children}</ArkDialog.Trigger>;
}

export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return <ArkDialog.Title className={clsx("dialog__title", "text-strong-heading-small", className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <ArkDialog.Description className={clsx("dialog__description", "text-default-body-medium", className)} {...props} />
  );
}

/** Right-aligned action row, typically holding Cancel + Confirm. */
export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return <div className={clsx("dialog__footer", className)} {...props} />;
}

/** Portalled backdrop + centered popup holding the alert body. */
export function AlertDialogContent({
  size = "sm",
  showClose = false,
  container,
  className,
  children,
  ...contentProps
}: AlertDialogContentProps) {
  return (
    <Portal container={container}>
      <ArkDialog.Backdrop className="dialog__backdrop" />
      <ArkDialog.Positioner className="dialog__positioner">
        <ArkDialog.Content className={clsx(dialogStyles({ size }), className)} {...contentProps}>
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

/** Dismisses the dialog without acting. Styled as a secondary button. */
export function AlertDialogCancel({ className, children, ...props }: AlertDialogCancelProps) {
  return (
    <ArkDialog.CloseTrigger
      className={clsx(buttonStyles({ intent: "secondary" }), className)}
      {...props}
    >
      {children}
    </ArkDialog.CloseTrigger>
  );
}

/** Confirms the action and closes. Pass `onClick` to run the action. */
export function AlertDialogConfirm({
  intent = "primary",
  className,
  children,
  ...props
}: AlertDialogConfirmProps) {
  return (
    <ArkDialog.CloseTrigger className={clsx(buttonStyles({ intent }), className)} {...props}>
      {children}
    </ArkDialog.CloseTrigger>
  );
}
