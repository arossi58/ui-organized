import { PreviewCard as BasePreviewCard } from "@base-ui-components/react/preview-card";
import { clsx } from "clsx";
import type {
  HoverCardProps,
  HoverCardTriggerProps,
  HoverCardContentProps,
  HoverCardArrowProps,
} from "./HoverCard.types.js";
import "./HoverCard.css";

/** HoverCard root — opens a rich preview when the trigger is hovered or focused. */
export function HoverCard(props: HoverCardProps) {
  return <BasePreviewCard.Root {...props} />;
}

/** The element that reveals the card on hover/focus. */
export function HoverCardTrigger(props: HoverCardTriggerProps) {
  return <BasePreviewCard.Trigger {...props} />;
}

export function HoverCardArrow({ className, ...props }: HoverCardArrowProps) {
  return <BasePreviewCard.Arrow className={clsx("hover-card__arrow", className)} {...props} />;
}

/** Portalled, positioned surface holding the preview content. */
export function HoverCardContent({
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset,
  showArrow = false,
  container,
  className,
  children,
  ...popupProps
}: HoverCardContentProps) {
  return (
    <BasePreviewCard.Portal container={container}>
      <BasePreviewCard.Positioner
        className="hover-card__positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <BasePreviewCard.Popup className={clsx("hover-card__popup", className)} {...popupProps}>
          {showArrow && <HoverCardArrow />}
          {children}
        </BasePreviewCard.Popup>
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  );
}
