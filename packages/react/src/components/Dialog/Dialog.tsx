import { Dialog as ArkDialog, Portal, useDialogContext } from "@ark-ui/react";
import { clsx } from "clsx";
import { dialogStyles } from "./Dialog.styles.js";
import { Icon } from "../Icon/index.js";
import type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogFooterProps,
} from "./Dialog.types.js";
import "./Dialog.css";
import { projectRender } from "../../utils/projectRender.js";
import { popupControls } from "../../utils/aria.js";
import { useContainedDialogProps, useOverlayPortal } from "../../preview/useOverlayPortal.js";

/** Dialog root — controls open state. */
export function Dialog({ open, defaultOpen, onOpenChange, modal, children }: DialogProps) {
  const contained = useContainedDialogProps();
  return (
    <ArkDialog.Root
      {...contained}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
      modal={modal ?? contained.modal}
    >
      {children}
    </ArkDialog.Root>
  );
}

/** Element that opens the dialog. Pass `render` to project a custom element. */
export function DialogTrigger({ render, children, ...props }: DialogTriggerProps) {
  const controls = popupControls(useDialogContext().open);
  if (render) {
    return (
      <ArkDialog.Trigger asChild {...controls} {...props}>
        {projectRender(render, children, "DialogTrigger")}
      </ArkDialog.Trigger>
    );
  }
  return (
    <ArkDialog.Trigger {...controls} {...props}>
      {children}
    </ArkDialog.Trigger>
  );
}

/** Closes the dialog when activated. Pass `render` to project a custom element. */
export function DialogClose({ render, children, ...props }: DialogCloseProps) {
  if (render) {
    return (
      <ArkDialog.CloseTrigger asChild {...props}>
        {projectRender(render, children, "DialogClose")}
      </ArkDialog.CloseTrigger>
    );
  }
  return <ArkDialog.CloseTrigger {...props}>{children}</ArkDialog.CloseTrigger>;
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <ArkDialog.Title className={clsx("dialog__title", "text-strong-heading-small", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <ArkDialog.Description className={clsx("dialog__description", "text-default-body-medium", className)} {...props} />
  );
}

/** Right-aligned action row, typically holding the dialog's buttons. */
export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div className={clsx("dialog__footer", className)} {...props} />;
}

/** Portalled backdrop + centered popup holding the dialog body. */
export function DialogContent({
  size,
  showClose = true,
  container,
  className,
  children,
  ...contentProps
}: DialogContentProps) {
  const portal = useOverlayPortal(container);
  // Ark centers the content with a Positioner (Base UI's popup self-centered).
  return (
    <Portal {...portal}>
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
