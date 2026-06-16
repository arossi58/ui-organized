import { ScrollArea as BaseScrollArea } from "@base-ui-components/react/scroll-area";
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
    <BaseScrollArea.Root className={clsx("scroll-area", className)} style={style}>
      <BaseScrollArea.Viewport className="scroll-area__viewport">
        <BaseScrollArea.Content className="scroll-area__content">{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {showVertical && (
        <BaseScrollArea.Scrollbar orientation="vertical" className="scroll-area__scrollbar">
          <BaseScrollArea.Thumb className="scroll-area__thumb" />
        </BaseScrollArea.Scrollbar>
      )}
      {showHorizontal && (
        <BaseScrollArea.Scrollbar orientation="horizontal" className="scroll-area__scrollbar">
          <BaseScrollArea.Thumb className="scroll-area__thumb" />
        </BaseScrollArea.Scrollbar>
      )}
      {orientation === "both" && <BaseScrollArea.Corner className="scroll-area__corner" />}
    </BaseScrollArea.Root>
  );
}
