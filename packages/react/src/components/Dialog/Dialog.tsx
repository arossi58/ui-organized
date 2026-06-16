import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
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

/** Dialog root — controls open state. */
export function Dialog(props: DialogProps) {
  return <BaseDialog.Root {...props} />;
}

/** Element that opens the dialog. Use `render` to project a custom button. */
export function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger {...props} />;
}

/** Closes the dialog when activated. */
export function DialogClose(props: DialogCloseProps) {
  return <BaseDialog.Close {...props} />;
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <BaseDialog.Title className={clsx("dialog__title", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description className={clsx("dialog__description", className)} {...props} />
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
  ...popupProps
}: DialogContentProps) {
  return (
    <BaseDialog.Portal container={container}>
      <BaseDialog.Backdrop className="dialog__backdrop" />
      <BaseDialog.Popup className={clsx(dialogStyles({ size }), className)} {...popupProps}>
        {showClose && (
          <BaseDialog.Close className="dialog__close" aria-label="Close">
            <Icon name="close" size={20} />
          </BaseDialog.Close>
        )}
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
