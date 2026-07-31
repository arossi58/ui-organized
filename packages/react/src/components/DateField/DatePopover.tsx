import { Popover as ArkPopover, Portal } from "@ark-ui/react";
import type { ReactNode, RefObject } from "react";
import "./DatePopover.css";
import {
  useOverlayPortal,
  type ContainedPositioning,
} from "../../preview/useOverlayPortal.js";

export interface DatePopoverProps {
  /** Optional container for the portal (defaults to document.body). */
  container?: HTMLElement | null;
  /**
   * Accessible name for the popup. Ark gives the content `role="dialog"`, and a
   * dialog needs a name — the calendar inside is not one, it's the content.
   * Pass the same phrase the trigger uses ("Choose date").
   */
  label: string;
  children: ReactNode;
}

/**
 * Build the Ark popover positioning that anchors the calendar to a field/row
 * element (rather than the small trigger button) and floats it below, left-aligned.
 * Set on the controlled `Popover.Root` alongside `initialFocusEl`.
 */
export function datePopoverPositioning(
  anchorRef: RefObject<HTMLElement | null>,
  /** Overrides from `useContainedPositioning()` when inside a preview box. */
  contained?: ContainedPositioning,
) {
  return {
    placement: "bottom-start" as const,
    gutter: 6,
    strategy: "fixed" as const,
    ...contained,
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
export function DatePopover({ container, label, children }: DatePopoverProps) {
  const portal = useOverlayPortal();
  return (
    // An explicitly-passed container still wins over the preview context.
    <Portal {...(container ? { container: { current: container } } : portal)}>
      <ArkPopover.Positioner className="date-popover-positioner">
        <ArkPopover.Content className="date-popover" aria-label={label}>
          {children}
        </ArkPopover.Content>
      </ArkPopover.Positioner>
    </Portal>
  );
}
