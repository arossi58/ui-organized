import { ScrollArea as ArkScrollArea } from "@ark-ui/react";
import { clsx } from "clsx";
import type { ScrollAreaProps } from "./ScrollArea.types.js";
import "./ScrollArea.css";

/**
 * A scrollable container with a custom, themed scrollbar. Give the Root a bounded
 * height (via `style={{ height }}` / `maxHeight`, or a class that sets one) so
 * its content can overflow.
 */
export function ScrollArea({ children, orientation = "vertical", className, style }: ScrollAreaProps) {
  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <ArkScrollArea.Root className={clsx("scroll-area", className)} style={style}>
      {/* The viewport is the element that scrolls, and a pointer drag is the only
          way to reach content below the fold unless it can take focus. Content
          that is itself focusable (links, inputs) makes this redundant but
          harmless; content that isn't — prose, a long table — depends on it. */}
      <ArkScrollArea.Viewport className="scroll-area__viewport" tabIndex={0}>
        <ArkScrollArea.Content className="scroll-area__content">{children}</ArkScrollArea.Content>
      </ArkScrollArea.Viewport>
      {showVertical && (
        <ArkScrollArea.Scrollbar orientation="vertical" className="scroll-area__scrollbar">
          <ArkScrollArea.Thumb className="scroll-area__thumb" />
        </ArkScrollArea.Scrollbar>
      )}
      {showHorizontal && (
        <ArkScrollArea.Scrollbar orientation="horizontal" className="scroll-area__scrollbar">
          <ArkScrollArea.Thumb className="scroll-area__thumb" />
        </ArkScrollArea.Scrollbar>
      )}
      {orientation === "both" && <ArkScrollArea.Corner className="scroll-area__corner" />}
    </ArkScrollArea.Root>
  );
}
