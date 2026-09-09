import type { Snippet } from "svelte";

export interface TabItem {
  /** Unique value identifier for this tab. */
  value: string | number;
  /**
   * Tab label. A string, or a snippet for anything richer.
   *
   * React takes a ReactNode here, which can be either. Svelte has no single type
   * that covers both, so the union is explicit and the component renders
   * whichever it was given.
   */
  label: string | Snippet;
  /** Panel content for this tab. */
  content: string | Snippet;
  /** Whether this tab is disabled. */
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab definitions including labels and panel content. */
  tabs: TabItem[];
  /** Active tab value. Bindable: `bind:value`. */
  value?: string | number;
  /** Initial active tab value for uncontrolled usage. Defaults to first tab. */
  defaultValue?: string | number;
  /** Callback fired when the active tab changes. */
  onValueChange?: (value: string | number) => void;
  /** Whether tabs render horizontally or vertically. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Tab sizing. 'default' uses body-large type, 'small' uses body-medium. Defaults to 'default'. */
  size?: "default" | "small";
  class?: string;
}
