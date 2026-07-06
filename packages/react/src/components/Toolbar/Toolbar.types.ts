import type * as React from "react";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout orientation. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
}

export type ToolbarGroupProps = React.HTMLAttributes<HTMLDivElement>;
