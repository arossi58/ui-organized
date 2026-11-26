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
  /**
   * A count after the label, such as unread items. It is visible text, so it
   * is read as part of the tab's name.
   */
  count?: number;
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
  /**
   * The look. `underline` (the default) rules the list and marks the selected
   * tab with a bar; `pill` fills the selected tab with the brand tint;
   * `bordered` sits the tabs in a track with the selected one raised.
   */
  variant?: "underline" | "pill" | "bordered";
  className?: string;
}
