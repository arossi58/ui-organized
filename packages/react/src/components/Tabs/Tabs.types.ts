import type * as React from "react";

export interface TabItem {
  /** Unique value identifier for this tab. */
  value: string | number;
  /** Tab label text. */
  label: React.ReactNode;
  /** Panel content for this tab. */
  content: React.ReactNode;
  /** Whether this tab is disabled. */
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab definitions including labels and panel content. */
  tabs: TabItem[];
  /** Controlled active tab value. */
  value?: string | number;
  /** Initial active tab value for uncontrolled usage. Defaults to first tab. */
  defaultValue?: string | number;
  /** Callback fired when the active tab changes. */
  onValueChange?: (value: string | number) => void;
  /** Whether tabs render horizontally or vertically. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Tab sizing. 'default' uses body-large type, 'small' uses body-medium. Defaults to 'default'. */
  size?: "default" | "small";
  className?: string;
}
