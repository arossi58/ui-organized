import type * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";

type PositionerProps = React.ComponentProps<typeof BaseTooltip.Positioner>;
type PortalProps = React.ComponentProps<typeof BaseTooltip.Portal>;

export interface TooltipProps {
  /** Content shown in the tooltip bubble. */
  content: React.ReactNode;
  /** The trigger. A single element is projected as the trigger; other nodes are wrapped. */
  children: React.ReactNode;
  /** Side of the trigger to position against. Defaults to 'top'. */
  side?: PositionerProps["side"];
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: PositionerProps["align"];
  /** Gap between the trigger and bubble, in px. Defaults to 6. */
  sideOffset?: number;
  /** Delay before opening, in ms. */
  delay?: number;
  /** Delay before closing, in ms. */
  closeDelay?: number;
  /** Render a pointer arrow. Defaults to true. */
  showArrow?: boolean;
  /** When true, renders the trigger without a tooltip. */
  disabled?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Portal container. Defaults to document.body. */
  container?: PortalProps["container"];
}

/** App-level provider that shares open/close delays across tooltips. */
export type TooltipProviderProps = React.ComponentProps<typeof BaseTooltip.Provider>;
