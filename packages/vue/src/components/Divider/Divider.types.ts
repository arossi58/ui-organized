export interface DividerProps {
  /** Orientation of the rule. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Margin along the cross axis (block when horizontal, inline when vertical). Defaults to 'none'. */
  spacing?: "none" | "sm" | "md" | "lg";
  /**
   * Where a label sits when the default slot has content: text such as "or",
   * or a control such as a "Show more" button. A labelled divider is
   * horizontal. Defaults to 'center'.
   */
  labelPosition?: "start" | "center" | "end";
}
