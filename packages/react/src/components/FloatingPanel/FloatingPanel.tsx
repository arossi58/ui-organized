import { FloatingPanel as ArkFloatingPanel, Portal } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { floatingPanelStyles } from "./FloatingPanel.styles.js";
import type {
  FloatingPanelProps,
  FloatingPanelTriggerProps,
  FloatingPanelContentProps,
  FloatingPanelHeaderProps,
  FloatingPanelTitleProps,
  FloatingPanelBodyProps,
  FloatingPanelCloseProps,
} from "./FloatingPanel.types.js";
import "@ui-organized/core/components/FloatingPanel/FloatingPanel.css";
import { useOverlayPortal } from "../../preview/useOverlayPortal.js";

/** Header affordances stay a fixed small edge — they mark the chrome rather
 *  than scaling with the panel's body text. */
const HEADER_ICON_SIZE = 16;

/** Root — owns open state, drag and resize. Wrap a trigger and content. */
export function FloatingPanel({
  open,
  defaultOpen,
  onOpenChange,
  draggable,
  resizable,
  defaultSize,
  minSize,
  maxSize,
  defaultPosition,
  strategy,
  children,
}: FloatingPanelProps) {
  return (
    <ArkFloatingPanel.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange && ((details) => onOpenChange(details.open))}
      draggable={draggable}
      resizable={resizable}
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      defaultPosition={defaultPosition}
      strategy={strategy}
    >
      {children}
    </ArkFloatingPanel.Root>
  );
}

/** Element that opens the panel. */
export function FloatingPanelTrigger({ children, ...props }: FloatingPanelTriggerProps) {
  return (
    <ArkFloatingPanel.Trigger {...props}>{children}</ArkFloatingPanel.Trigger>
  );
}

/**
 * The panel surface itself, portalled and positioned.
 *
 * Unlike every other overlay in this package, FloatingPanel is **not**
 * popper-backed — its positioner carries only the drag position and no inline
 * `z-index`. It still declares stacking on the content rather than the
 * positioner, and is still registered in `POPPER_LAYERS`, so the same "style the
 * popup" rule and the same tier assertion cover it. See overlayStacking.test.ts.
 */
export function FloatingPanelContent({
  size,
  variant,
  container,
  className,
  children,
}: FloatingPanelContentProps) {
  const portal = useOverlayPortal(container);

  return (
    <Portal {...portal}>
      {/* The positioner className must stay a plain string literal — the
          overlay-stacking test scans for it. */}
      <ArkFloatingPanel.Positioner className="floating-panel__positioner">
        <ArkFloatingPanel.Content
          className={clsx(floatingPanelStyles({ size, variant }), className)}
        >
          {children}
          {/* Resize handles on all four edges and corners. zag positions each
              from its `axis`; only the hit area is styled. */}
          {(["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const).map((axis) => (
            <ArkFloatingPanel.ResizeTrigger
              key={axis}
              axis={axis}
              className={`floating-panel__resize floating-panel__resize--${axis}`}
            />
          ))}
        </ArkFloatingPanel.Content>
      </ArkFloatingPanel.Positioner>
    </Portal>
  );
}

/**
 * The panel's title bar. Wraps its children in the drag handle, so grabbing the
 * header is what moves the panel — which is why the title and close button go
 * inside this part rather than straight into the content.
 */
export function FloatingPanelHeader({ className, children, ...props }: FloatingPanelHeaderProps) {
  return (
    <ArkFloatingPanel.Header
      className={clsx("floating-panel__header", className)}
      {...props}
    >
      <ArkFloatingPanel.DragTrigger className="floating-panel__drag">
        {children}
      </ArkFloatingPanel.DragTrigger>
    </ArkFloatingPanel.Header>
  );
}

/** Heading for the panel, and the thing that names it. */
export function FloatingPanelTitle({ className, ...props }: FloatingPanelTitleProps) {
  return (
    <ArkFloatingPanel.Title
      className={clsx("floating-panel__title", "text-strong-body-large", className)}
      {...props}
    />
  );
}

/** Scrollable body below the header. */
export function FloatingPanelBody({ className, ...props }: FloatingPanelBodyProps) {
  return (
    <ArkFloatingPanel.Body
      className={clsx("floating-panel__body", "text-default-body-medium", className)}
      {...props}
    />
  );
}

/** Closes the panel when activated. */
export function FloatingPanelClose({ children, className, ...props }: FloatingPanelCloseProps) {
  return (
    <ArkFloatingPanel.CloseTrigger
      className={clsx("floating-panel__close", className)}
      aria-label="Close panel"
      {...props}
    >
      {children ?? <Icon name="close" size={HEADER_ICON_SIZE} />}
    </ArkFloatingPanel.CloseTrigger>
  );
}
