import type * as React from "react";

export interface ScrollAreaProps {
  /** Scrollable content. */
  children: React.ReactNode;
  /**
   * Which scrollbars to render. Defaults to 'vertical'.
   * The Root needs a bounded height/width (via `style` or `className`) to scroll.
   */
  orientation?: "vertical" | "horizontal" | "both";
  className?: string;
  /** Inline styles applied to the Root — typically a `height`/`maxHeight`. */
  style?: React.CSSProperties;
}
