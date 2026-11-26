import type { Component } from "vue";

export interface TabItem {
  /** Unique value identifier for this tab. */
  value: string | number;
  /** Tab label. A string, or a component for anything richer. */
  label: string | Component;
  /** Panel content for this tab. */
  content: string | Component;
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
  /** Active tab value. Use `v-model` for two-way binding. */
  modelValue?: string | number;
  /** Initial active tab value for uncontrolled usage. Defaults to first tab. */
  defaultValue?: string | number;
  /** Whether tabs render horizontally or vertically. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Tab sizing. 'default' uses body-large type, 'small' uses body-medium. */
  size?: "default" | "small";
  /**
   * The look. `underline` (the default) rules the list and marks the selected
   * tab with a bar; `pill` fills the selected tab with the brand tint;
   * `bordered` sits the tabs in a track with the selected one raised.
   */
  variant?: "underline" | "pill" | "bordered";
}
