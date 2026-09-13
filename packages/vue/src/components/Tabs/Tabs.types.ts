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
}
