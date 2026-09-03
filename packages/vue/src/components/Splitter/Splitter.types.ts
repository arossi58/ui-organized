import type { Component } from "vue";

export interface SplitterPanelDef {
  /** Unique id across the splitter. Resize triggers are derived from adjacent ids. */
  id: string;
  /**
   * Human name for the panel, used to label the resize handles beside it
   * ("Resize sidebar and main"). Defaults to `id`, which is fine when ids read
   * as words and worth setting when they don't.
   */
  label?: string;
  /** Panel contents. A string, or a component for anything richer. */
  content?: string | Component;
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
  /** Sizes, as percentages, one per panel. Use `v-model:size` for two-way binding. */
  size?: number[];
  /** Initial sizes for the uncontrolled case. Defaults to an even split. */
  defaultSize?: number[];
  /** Split direction. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Handle treatment. `subtle` shows the rule only on hover. Defaults to 'default'. */
  variant?: "default" | "subtle";
}

/*
 * There is deliberately no `disabled` prop: the machine has none. Resizing is
 * constrained per panel instead — give a panel equal `minSize` and `maxSize` and
 * the handles beside it become inert, which is what zag reports as
 * `data-disabled` on the affected resize trigger.
 *
 * `collapsible` lives inside `panels` rather than on the component, so it never
 * reaches Vue's prop declarations and never meets the Boolean cast that turns an
 * absent prop into a deliberate `false` — see ../../props.ts.
 */
