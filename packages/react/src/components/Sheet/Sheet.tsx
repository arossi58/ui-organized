import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
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
export function Sheet(props: SheetProps) {
  return <BaseDialog.Root {...props} />;
}

/** Element that opens the sheet. Use `render` to project a custom button. */
export function SheetTrigger(props: SheetTriggerProps) {
  return <BaseDialog.Trigger {...props} />;
}

/** Closes the sheet when activated. */
export function SheetClose(props: SheetCloseProps) {
  return <BaseDialog.Close {...props} />;
}

export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return <BaseDialog.Title className={clsx("dialog__title", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return <BaseDialog.Description className={clsx("dialog__description", className)} {...props} />;
}

/** Right-aligned action row, typically holding the sheet's buttons. */
export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return <div className={clsx("dialog__footer", className)} {...props} />;
}

/** Portalled backdrop + edge-anchored panel holding the sheet body. */
export function SheetContent({
  side,
  size,
  showClose = true,
  container,
  className,
  children,
  ...popupProps
}: SheetContentProps) {
  return (
    <BaseDialog.Portal container={container}>
      <BaseDialog.Backdrop className="dialog__backdrop" />
      <BaseDialog.Popup className={clsx(sheetStyles({ side, size }), className)} {...popupProps}>
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
