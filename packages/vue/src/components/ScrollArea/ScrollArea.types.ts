export interface ScrollAreaProps {
  /**
   * Which scrollbars to render. Defaults to 'vertical'.
   * The Root needs a bounded height/width to scroll.
   */
  orientation?: "vertical" | "horizontal" | "both";
}
