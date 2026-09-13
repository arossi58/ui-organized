import type { Snippet } from "svelte";

export interface SplitterPanelDef {
  /** Unique id across the splitter. Resize triggers are derived from adjacent ids. */
  id: string;
  /**
   * Human name for the panel, used to label the resize handles beside it
   * ("Resize sidebar and main"). Defaults to `id`, which is fine when ids read
   * as words and worth setting when they don't.
   */
  label?: string;
  /**
   * Panel contents. A string, or a snippet for anything richer.
   *
   * React takes a ReactNode here, which can be either. Svelte has no single type
   * that covers both, so the union is explicit and the component renders
   * whichever it was given.
   */
  content?: string | Snippet;
  /** Smallest size, as a percentage of the group. */
  minSize?: number;
  /** Largest size, as a percentage of the group. */
  maxSize?: number;
  /** Allows the panel to collapse to `collapsedSize`. */
  collapsible?: boolean;
  /** Size the panel collapses to, as a percentage. Defaults to 0. */
  collapsedSize?: number;
}

export interface SplitterProps {
  /** The panels, in order. A resize handle is placed between each adjacent pair. */
  panels: SplitterPanelDef[];
  /** Sizes, as percentages, one per panel. Bindable: `bind:size`. */
  size?: number[];
  /** Initial sizes for the uncontrolled case. Defaults to an even split. */
  defaultSize?: number[];
  /** Called continuously while a handle is dragged. */
  onResize?: (size: number[]) => void;
  /** Called once, when the drag ends. */
  onResizeEnd?: (size: number[]) => void;
  /** Split direction. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Handle treatment. `subtle` shows the rule only on hover. Defaults to 'default'. */
  variant?: "default" | "subtle";
  class?: string;
}

/*
 * There is deliberately no `disabled` prop: the machine has none. Resizing is
 * constrained per panel instead — give a panel equal `minSize` and `maxSize` and
 * the handles beside it become inert, which is what zag reports as
 * `data-disabled` on the affected resize trigger.
 */
