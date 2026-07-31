import * as React from "react";
import { Tooltip as ArkTooltip, Portal } from "@ark-ui/react";
import type { TooltipProps, TooltipProviderProps } from "./Tooltip.types.js";
import "./Tooltip.css";
import { useContainedPositioning, useOverlayPortal } from "../../preview/useOverlayPortal.js";

/**
 * Ark UI has no app-level "shared delays" provider (delays are per-tooltip Root
 * props), so the facade preserves that contract with a small React context that
 * supplies default open/close delays to descendant tooltips.
 */
const TooltipDelayContext = React.createContext<{ delay?: number; closeDelay?: number }>(
  {},
);

/** Shares hover/close delays across the tooltips it wraps. Optional, app-level. */
export function TooltipProvider({ children, delay, closeDelay }: TooltipProviderProps) {
  const value = React.useMemo(() => ({ delay, closeDelay }), [delay, closeDelay]);
  return <TooltipDelayContext.Provider value={value}>{children}</TooltipDelayContext.Provider>;
}

/**
 * Lightweight tooltip. Wrap a trigger and pass `content`:
 * `<Tooltip content="Copy"><IconButton …/></Tooltip>`.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  sideOffset = 6,
  delay,
  closeDelay,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  container,
}: TooltipProps) {
  const shared = React.useContext(TooltipDelayContext);
  // Both before the `disabled` bail-out — hooks can't sit behind an early return.
  const containedPositioning = useContainedPositioning();
  const portal = useOverlayPortal(container);
  if (disabled) return <>{children}</>;

  // Base UI took separate side/align/sideOffset props; Ark/Zag takes a single
  // `positioning` config where placement combines side+align and gutter is the gap.
  const placement = align === "center" ? side : (`${side}-${align}` as const);

  const trigger = React.isValidElement(children) ? (
    <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
  ) : (
    <ArkTooltip.Trigger className="tooltip__trigger">{children}</ArkTooltip.Trigger>
  );

  return (
    <ArkTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
      openDelay={delay ?? shared.delay}
      closeDelay={closeDelay ?? shared.closeDelay}
      positioning={{ placement, gutter: sideOffset, ...containedPositioning }}
    >
      {trigger}
      <Portal {...portal}>
        <ArkTooltip.Positioner className="tooltip__positioner">
          <ArkTooltip.Content className="tooltip__popup text-default-body-small">
            {content}
          </ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.Root>
  );
}
