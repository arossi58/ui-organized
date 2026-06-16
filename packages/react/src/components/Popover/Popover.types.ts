import type * as React from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type PopoverProps = React.ComponentProps<typeof BasePopover.Root>;
export type PopoverTriggerProps = React.ComponentProps<typeof BasePopover.Trigger>;
export type PopoverCloseProps = React.ComponentProps<typeof BasePopover.Close>;
export type PopoverArrowProps = Omit<
  React.ComponentProps<typeof BasePopover.Arrow>,
  "className"
> &
  StringClassName;

type PositionerProps = React.ComponentProps<typeof BasePopover.Positioner>;
type PortalProps = React.ComponentProps<typeof BasePopover.Portal>;

export interface PopoverContentProps
  extends Omit<React.ComponentProps<typeof BasePopover.Popup>, "className">,
    StringClassName {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: PositionerProps["side"];
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: PositionerProps["align"];
  /** Gap between trigger and popup, in px. Defaults to 8. */
  sideOffset?: PositionerProps["sideOffset"];
  /** Offset along the alignment axis, in px. */
  alignOffset?: PositionerProps["alignOffset"];
  /** Render a pointer arrow toward the trigger. Defaults to false. */
  showArrow?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: PortalProps["container"];
}
