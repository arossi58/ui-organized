import type * as React from "react";

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout orientation. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
}
