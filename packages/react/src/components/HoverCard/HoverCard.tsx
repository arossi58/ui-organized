import * as React from "react";
import { HoverCard as ArkHoverCard, Portal } from "@ark-ui/react";
import { clsx } from "clsx";
import type {
  HoverCardProps,
  HoverCardTriggerProps,
  HoverCardContentProps,
  HoverCardArrowProps,
} from "./HoverCard.types.js";
import "./HoverCard.css";

type Positioning = NonNullable<React.ComponentProps<typeof ArkHoverCard.Root>["positioning"]>;

// Ark sets placement on the Root; the facade keeps side/align on the content, so
// bridge positioning up via context (see Popover for the same pattern).
const SetPositioningContext = React.createContext<((p: Positioning) => void) | null>(null);

/** HoverCard root — opens a rich preview when the trigger is hovered or focused. */
export function HoverCard({
  open,
  defaultOpen,
  onOpenChange,
  openDelay,
  closeDelay,
  children,
}: HoverCardProps) {
  const [positioning, setPositioning] = React.useState<Positioning>({
    placement: "bottom",
    gutter: 8,
  });
  return (
    <SetPositioningContext.Provider value={setPositioning}>
      <ArkHoverCard.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
        openDelay={openDelay}
        closeDelay={closeDelay}
        positioning={positioning}
      >
        {children}
      </ArkHoverCard.Root>
    </SetPositioningContext.Provider>
  );
}

/** The element that reveals the card on hover/focus. */
export function HoverCardTrigger({ render, children, ...props }: HoverCardTriggerProps) {
  if (render) {
    return (
      <ArkHoverCard.Trigger asChild {...props}>
        {render}
      </ArkHoverCard.Trigger>
    );
  }
  return <ArkHoverCard.Trigger {...props}>{children}</ArkHoverCard.Trigger>;
}

export function HoverCardArrow({ className, ...props }: HoverCardArrowProps) {
  return (
    <ArkHoverCard.Arrow className={clsx("hover-card__arrow", className)} {...props}>
      <ArkHoverCard.ArrowTip />
    </ArkHoverCard.Arrow>
  );
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
  ...contentProps
}: HoverCardContentProps) {
  const setPositioning = React.useContext(SetPositioningContext);
  const placement = align === "center" ? side : (`${side}-${align}` as const);
  React.useLayoutEffect(() => {
    setPositioning?.({
      placement,
      gutter: sideOffset,
      offset: alignOffset != null ? { crossAxis: alignOffset } : undefined,
    });
  }, [setPositioning, placement, sideOffset, alignOffset]);

  return (
    <Portal container={container}>
      <ArkHoverCard.Positioner className="hover-card__positioner">
        <ArkHoverCard.Content className={clsx("hover-card__popup", className)} {...contentProps}>
          {showArrow && <HoverCardArrow />}
          {children}
        </ArkHoverCard.Content>
      </ArkHoverCard.Positioner>
    </Portal>
  );
}
