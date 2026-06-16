import type * as React from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui-components/react/preview-card";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type HoverCardProps = React.ComponentProps<typeof BasePreviewCard.Root>;
export type HoverCardTriggerProps = React.ComponentProps<typeof BasePreviewCard.Trigger>;
export type HoverCardArrowProps = Omit<
  React.ComponentProps<typeof BasePreviewCard.Arrow>,
  "className"
> &
  StringClassName;

type PositionerProps = React.ComponentProps<typeof BasePreviewCard.Positioner>;
type PortalProps = React.ComponentProps<typeof BasePreviewCard.Portal>;

export interface HoverCardContentProps
  extends Omit<React.ComponentProps<typeof BasePreviewCard.Popup>, "className">,
    StringClassName {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: PositionerProps["side"];
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: PositionerProps["align"];
  /** Gap between trigger and card, in px. Defaults to 8. */
  sideOffset?: PositionerProps["sideOffset"];
  /** Offset along the alignment axis, in px. */
  alignOffset?: PositionerProps["alignOffset"];
  /** Render a pointer arrow toward the trigger. Defaults to false. */
  showArrow?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: PortalProps["container"];
}
