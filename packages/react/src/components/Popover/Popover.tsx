import * as React from "react";
import { Popover as ArkPopover, Portal } from "@ark-ui/react";
import { clsx } from "clsx";
import type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverCloseProps,
} from "./Popover.types.js";
import "./Popover.css";

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
  return (
    <SetPositioningContext.Provider value={setPositioning}>
      <ArkPopover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
        modal={modal}
        positioning={positioning}
      >
        {children}
      </ArkPopover.Root>
    </SetPositioningContext.Provider>
  );
}

/** Element that toggles the popover. Pass `render` to project a custom element. */
export function PopoverTrigger({ render, children, ...props }: PopoverTriggerProps) {
  if (render) {
    return (
      <ArkPopover.Trigger asChild {...props}>
        {render}
      </ArkPopover.Trigger>
    );
  }
  return <ArkPopover.Trigger {...props}>{children}</ArkPopover.Trigger>;
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

  return (
    <Portal container={container}>
      <ArkPopover.Positioner className="popover__positioner">
        <ArkPopover.Content className={clsx("popover__popup", "text-default-body-medium", className)} {...contentProps}>
          {children}
        </ArkPopover.Content>
      </ArkPopover.Positioner>
    </Portal>
  );
}

/** Closes the popover when activated. Pass `render` to project a custom element. */
export function PopoverClose({ render, children, ...props }: PopoverCloseProps) {
  if (render) {
    return (
      <ArkPopover.CloseTrigger asChild {...props}>
        {render}
      </ArkPopover.CloseTrigger>
    );
  }
  return <ArkPopover.CloseTrigger {...props}>{children}</ArkPopover.CloseTrigger>;
}
