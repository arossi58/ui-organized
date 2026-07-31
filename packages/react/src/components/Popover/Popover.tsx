import * as React from "react";
import { Popover as ArkPopover, Portal, usePopoverContext } from "@ark-ui/react";
import { clsx } from "clsx";
import type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseProps,
} from "./Popover.types.js";
import "./Popover.css";
import { projectRender } from "../../utils/projectRender.js";
import { popupControls } from "../../utils/aria.js";
import {
  useContainedPopoverProps,
  useContainedPositioning,
  useOverlayPortal,
} from "../../preview/useOverlayPortal.js";

type Positioning = NonNullable<React.ComponentProps<typeof ArkPopover.Root>["positioning"]>;

// Ark configures placement on the Root (`positioning`), but the facade keeps
// `side`/`align`/`sideOffset` on <PopoverContent>. Bridge them up: Content sets
// the positioning via context before the popover is opened.
const SetPositioningContext = React.createContext<((p: Positioning) => void) | null>(null);

/** Popover root — controls open state. Wrap a trigger and content. */
export function Popover({ open, defaultOpen, onOpenChange, modal, children }: PopoverProps) {
  const [positioning, setPositioning] = React.useState<Positioning>({
    placement: "bottom",
    gutter: 8,
  });
  const contained = useContainedPopoverProps();
  const containedPositioning = useContainedPositioning();
  return (
    <SetPositioningContext.Provider value={setPositioning}>
      <ArkPopover.Root
        {...contained}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
        modal={modal ?? contained.modal}
        positioning={{ ...positioning, ...containedPositioning }}
      >
        {children}
      </ArkPopover.Root>
    </SetPositioningContext.Provider>
  );
}

/** Element that toggles the popover. Pass `render` to project a custom element. */
export function PopoverTrigger({ render, children, ...props }: PopoverTriggerProps) {
  const controls = popupControls(usePopoverContext().open);
  if (render) {
    return (
      <ArkPopover.Trigger asChild {...controls} {...props}>
        {projectRender(render, children, "PopoverTrigger")}
      </ArkPopover.Trigger>
    );
  }
  return (
    <ArkPopover.Trigger {...controls} {...props}>
      {children}
    </ArkPopover.Trigger>
  );
}

/** Portalled, positioned surface holding the popover body. */
export function PopoverContent({
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset,
  container,
  className,
  children,
  ...contentProps
}: PopoverContentProps) {
  const setPositioning = React.useContext(SetPositioningContext);
  const placement = align === "center" ? side : (`${side}-${align}` as const);
  React.useLayoutEffect(() => {
    setPositioning?.({
      placement,
      gutter: sideOffset,
      offset: alignOffset != null ? { crossAxis: alignOffset } : undefined,
    });
  }, [setPositioning, placement, sideOffset, alignOffset]);

  const portal = useOverlayPortal(container);
  return (
    <Portal {...portal}>
      <ArkPopover.Positioner className="popover__positioner">
        <ArkPopover.Content className={clsx("popover__popup", "text-default-body-medium", className)} {...contentProps}>
          {children}
        </ArkPopover.Content>
      </ArkPopover.Positioner>
    </Portal>
  );
}

/**
 * Heading for the popover, and the thing that names it.
 *
 * Ark gives the content `role="dialog"`, which needs an accessible name; it
 * points at this part when one is rendered. A popover with neither a title nor
 * an `aria-label` on its content reaches a screen reader as an unnamed dialog.
 */
export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <ArkPopover.Title
      className={clsx("popover__title", "text-strong-body-large", className)}
      {...props}
    />
  );
}

/** Supporting copy under the title; becomes the popover's description. */
export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <ArkPopover.Description
      className={clsx("popover__description", "text-default-body-medium", className)}
      {...props}
    />
  );
}

/** Closes the popover when activated. Pass `render` to project a custom element. */
export function PopoverClose({ render, children, ...props }: PopoverCloseProps) {
  if (render) {
    return (
      <ArkPopover.CloseTrigger asChild {...props}>
        {projectRender(render, children, "PopoverClose")}
      </ArkPopover.CloseTrigger>
    );
  }
  return <ArkPopover.CloseTrigger {...props}>{children}</ArkPopover.CloseTrigger>;
}
