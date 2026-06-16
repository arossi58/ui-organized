import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import type { TooltipProps, TooltipProviderProps } from "./Tooltip.types.js";
import "./Tooltip.css";

/** Shares hover/close delays across the tooltips it wraps. Optional, app-level. */
export function TooltipProvider(props: TooltipProviderProps) {
  return <BaseTooltip.Provider {...props} />;
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
  showArrow = true,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  container,
}: TooltipProps) {
  if (disabled) return <>{children}</>;

  const trigger = React.isValidElement(children) ? (
    <BaseTooltip.Trigger render={children as React.ReactElement<Record<string, unknown>>} />
  ) : (
    <BaseTooltip.Trigger className="tooltip__trigger">{children}</BaseTooltip.Trigger>
  );

  const root = (
    <BaseTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger}
      <BaseTooltip.Portal container={container}>
        <BaseTooltip.Positioner
          className="tooltip__positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BaseTooltip.Popup className="tooltip__popup">
            {content}
            {showArrow && <BaseTooltip.Arrow className="tooltip__arrow" />}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );

  // `delay`/`closeDelay` are configured on the provider in Base UI. Wrap in a
  // local provider when given so a standalone tooltip can tune its own timing
  // (and override any app-level TooltipProvider for this tooltip).
  if (delay != null || closeDelay != null) {
    return (
      <BaseTooltip.Provider delay={delay} closeDelay={closeDelay}>
        {root}
      </BaseTooltip.Provider>
    );
  }

  return root;
}
