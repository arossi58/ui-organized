import { Popover } from "@base-ui-components/react/popover";
import type { ReactNode, RefObject } from "react";
import "./DatePopover.css";

export interface DatePopoverProps {
  /** Element the popup anchors to (the whole field, so it aligns to its edge). */
  anchorRef: RefObject<HTMLElement | null>;
  /** Element focused when the popup opens (the calendar's active day). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Optional container for the portal (defaults to document.body). */
  container?: HTMLElement | null;
  children: ReactNode;
}

/**
 * The portal + positioner + popup surface shared by the date pickers. Must be
 * rendered inside a controlled `Popover.Root`; the trigger lives in the field.
 */
export function DatePopover({ anchorRef, initialFocus, container, children }: DatePopoverProps) {
  return (
    <Popover.Portal container={container}>
      <Popover.Positioner
        className="date-popover-positioner"
        anchor={anchorRef}
        side="bottom"
        align="start"
        sideOffset={6}
        positionMethod="fixed"
      >
        <Popover.Popup className="date-popover" initialFocus={initialFocus}>
          {children}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  );
}
