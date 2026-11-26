import { Drawer as ArkDrawer, Portal, useDrawerContext } from "@ark-ui/react";
import { clsx } from "clsx";
import { DRAWER_CLASS, DRAWER_CLOSE_ICON_SIZE, popupControls } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import type {
  DrawerProps,
  DrawerTriggerProps,
  DrawerContentProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
  DrawerCloseProps,
  DrawerFooterProps,
} from "./Drawer.types.js";
// Reuses the Dialog chrome (title, description, footer, close).
import "@ui-organized/core/components/Dialog/Dialog.css";
import "@ui-organized/core/components/Drawer/Drawer.css";
import { projectRender } from "../../utils/projectRender.js";
import { useContainedDialogProps, useOverlayPortal } from "../../preview/useOverlayPortal.js";
import { glyph } from "../../icons/glyph.js";

/** Drawer root: a panel along the bottom edge, dismissed by swiping it down. */
export function Drawer({ open, defaultOpen, onOpenChange, modal, children }: DrawerProps) {
  const contained = useContainedDialogProps();
  return (
    <ArkDrawer.Root
      {...contained}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
      modal={modal ?? contained.modal}
    >
      {children}
    </ArkDrawer.Root>
  );
}

/** Element that opens the drawer. Pass `render` to project a custom element. */
export function DrawerTrigger({ render, children, ...props }: DrawerTriggerProps) {
  // The panel it names is only mounted while open, so the reference is dropped
  // the rest of the time rather than left dangling.
  const controls = popupControls(useDrawerContext().open);
  if (render) {
    return (
      <ArkDrawer.Trigger asChild {...controls} {...props}>
        {projectRender(render, children, "DrawerTrigger")}
      </ArkDrawer.Trigger>
    );
  }
  return (
    <ArkDrawer.Trigger {...controls} {...props}>
      {children}
    </ArkDrawer.Trigger>
  );
}

/** Closes the drawer when activated. Pass `render` to project a custom element. */
export function DrawerClose({ render, children, ...props }: DrawerCloseProps) {
  if (render) {
    return (
      <ArkDrawer.CloseTrigger asChild {...props}>
        {projectRender(render, children, "DrawerClose")}
      </ArkDrawer.CloseTrigger>
    );
  }
  // zag 1.41, which Ark React runs, leaves `type` off this button; 1.43 adds it.
  return (
    <ArkDrawer.CloseTrigger type="button" {...props}>
      {children}
    </ArkDrawer.CloseTrigger>
  );
}

export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return <ArkDrawer.Title className={clsx(DRAWER_CLASS.title, className)} {...props} />;
}

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return <ArkDrawer.Description className={clsx(DRAWER_CLASS.description, className)} {...props} />;
}

/** The action row. Its buttons fill the row, the reachable ones on a phone. */
export function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return <div className={clsx(DRAWER_CLASS.footer, className)} {...props} />;
}

/** Portalled backdrop and the panel along the bottom edge, with its grabber and close button. */
export function DrawerContent({
  showGrabber = true,
  showClose = true,
  container,
  className,
  children,
  ...contentProps
}: DrawerContentProps) {
  const portal = useOverlayPortal(container);
  return (
    <Portal {...portal}>
      <ArkDrawer.Backdrop className={DRAWER_CLASS.backdrop} />
      <ArkDrawer.Positioner className={DRAWER_CLASS.positioner}>
        <ArkDrawer.Content className={clsx(DRAWER_CLASS.popup, className)} {...contentProps}>
          {showGrabber && (
            <ArkDrawer.Grabber className={DRAWER_CLASS.grabber}>
              <ArkDrawer.GrabberIndicator className={DRAWER_CLASS.grabberIndicator} />
            </ArkDrawer.Grabber>
          )}
          {showClose && (
            <ArkDrawer.CloseTrigger type="button" className={DRAWER_CLASS.close} aria-label="Close">
              <Icon name={glyph("close")} size={DRAWER_CLOSE_ICON_SIZE} />
            </ArkDrawer.CloseTrigger>
          )}
          {children}
        </ArkDrawer.Content>
      </ArkDrawer.Positioner>
    </Portal>
  );
}
