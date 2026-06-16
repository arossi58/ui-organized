import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { clsx } from "clsx";
import type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverCloseProps,
  PopoverArrowProps,
} from "./Popover.types.js";
import "./Popover.css";

/** Popover root — controls open state. Wrap a trigger and content. */
export function Popover(props: PopoverProps) {
  return <BasePopover.Root {...props} />;
}

/** Element that toggles the popover. Use `render` to project a custom button. */
export function PopoverTrigger(props: PopoverTriggerProps) {
  return <BasePopover.Trigger {...props} />;
}

export function PopoverArrow({ className, ...props }: PopoverArrowProps) {
  return <BasePopover.Arrow className={clsx("popover__arrow", className)} {...props} />;
}

/** Portalled, positioned surface holding the popover body. */
export function PopoverContent({
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset,
  showArrow = false,
  container,
  className,
  children,
  ...popupProps
}: PopoverContentProps) {
  return (
    <BasePopover.Portal container={container}>
      <BasePopover.Positioner
        className="popover__positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <BasePopover.Popup className={clsx("popover__popup", className)} {...popupProps}>
          {showArrow && <PopoverArrow />}
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

/** Closes the popover when activated. */
export function PopoverClose(props: PopoverCloseProps) {
  return <BasePopover.Close {...props} />;
}
