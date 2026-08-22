export interface DividerProps {
  /** Orientation of the rule. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Margin along the cross axis (block when horizontal, inline when vertical). Defaults to 'none'. */
  spacing?: "none" | "sm" | "md" | "lg";
}
