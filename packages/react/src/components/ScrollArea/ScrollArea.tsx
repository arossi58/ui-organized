import { ScrollArea as ArkScrollArea } from "@ark-ui/react";
import { clsx } from "clsx";
import type { ScrollAreaProps } from "./ScrollArea.types.js";
import "./ScrollArea.css";

/**
 * A scrollable container with a custom, themed scrollbar. Give the Root a bounded
 * height (via `style={{ height }}` / `maxHeight`) so its content can overflow.
 */
export function ScrollArea({ children, orientation = "vertical", className, style }: ScrollAreaProps) {
  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <ArkScrollArea.Root className={clsx("scroll-area", className)} style={style}>
      <ArkScrollArea.Viewport className="scroll-area__viewport">
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
