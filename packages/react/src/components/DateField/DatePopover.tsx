import { Popover as ArkPopover, Portal } from "@ark-ui/react";
import type { ReactNode, RefObject } from "react";
import "./DatePopover.css";

export interface DatePopoverProps {
  /** Optional container for the portal (defaults to document.body). */
  container?: HTMLElement | null;
  children: ReactNode;
}

/**
 * Build the Ark popover positioning that anchors the calendar to a field/row
 * element (rather than the small trigger button) and floats it below, left-aligned.
 * Set on the controlled `Popover.Root` alongside `initialFocusEl`.
 */
export function datePopoverPositioning(anchorRef: RefObject<HTMLElement | null>) {
  return {
    placement: "bottom-start" as const,
    gutter: 6,
    strategy: "fixed" as const,
    getAnchorRect: () => {
      const r = anchorRef.current?.getBoundingClientRect();
      return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
    },
  };
}

/**
 * The portal + positioner + popup surface shared by the date pickers. Must be
 * rendered inside a controlled `ArkPopover.Root` (which owns the anchor
 * positioning and initial focus); the trigger lives in the field.
 */
export function DatePopover({ container, children }: DatePopoverProps) {
  return (
    <Portal container={container ? { current: container } : undefined}>
      <ArkPopover.Positioner className="date-popover-positioner">
        <ArkPopover.Content className="date-popover">{children}</ArkPopover.Content>
      </ArkPopover.Positioner>
    </Portal>
  );
}
