import { AlertDialog as BaseAlertDialog } from "@base-ui-components/react/alert-dialog";
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
export function AlertDialog(props: AlertDialogProps) {
  return <BaseAlertDialog.Root {...props} />;
}

/** Element that opens the dialog. Use `render` to project a custom button. */
export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <BaseAlertDialog.Trigger {...props} />;
}

export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return <BaseAlertDialog.Title className={clsx("dialog__title", className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <BaseAlertDialog.Description className={clsx("dialog__description", className)} {...props} />
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
  ...popupProps
}: AlertDialogContentProps) {
  return (
    <BaseAlertDialog.Portal container={container}>
      <BaseAlertDialog.Backdrop className="dialog__backdrop" />
      <BaseAlertDialog.Popup className={clsx(dialogStyles({ size }), className)} {...popupProps}>
        {showClose && (
          <BaseAlertDialog.Close className="dialog__close" aria-label="Close">
            <Icon name="close" size={20} />
          </BaseAlertDialog.Close>
        )}
        {children}
      </BaseAlertDialog.Popup>
    </BaseAlertDialog.Portal>
  );
}

/** Dismisses the dialog without acting. Styled as a secondary button. */
export function AlertDialogCancel({ className, children, ...props }: AlertDialogCancelProps) {
  return (
    <BaseAlertDialog.Close
      className={clsx(buttonStyles({ intent: "secondary" }), className)}
      {...props}
    >
      {children}
    </BaseAlertDialog.Close>
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
    <BaseAlertDialog.Close className={clsx(buttonStyles({ intent }), className)} {...props}>
      {children}
    </BaseAlertDialog.Close>
  );
}
