import type * as React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the rule. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Margin along the cross axis (block margin when horizontal, inline when vertical). Defaults to 'md'. */
  spacing?: "none" | "sm" | "md" | "lg";
}
