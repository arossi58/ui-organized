import type { CanonicalIconName } from "@ui-organized/utils";
import type { ControlSize } from "@ui-organized/core";

export interface TreeViewNode {
  /** Unique id across the whole tree. Selection and expansion are keyed on this. */
  id: string;
  /** Display text. */
  label: string;
  /** Child nodes. A node with children renders as a branch, one without as a leaf. */
  children?: TreeViewNode[];
  /** Icon shown before the label. Branches default to a folder, leaves to none. */
  icon?: CanonicalIconName;
  /** Prevents selection while keeping the node visible. */
  disabled?: boolean;
}

export interface TreeViewProps {
  /** The tree to render, in display order. */
  items: TreeViewNode[];
  /** Accessible label rendered above the tree. */
  label?: string;
  /** Selected node ids. Bindable: `bind:selectedValue`. */
  selectedValue?: string[];
  /** Initial selection for the uncontrolled case. */
  defaultSelectedValue?: string[];
  /** Called with the full selection whenever it changes. */
  onSelectionChange?: (value: string[]) => void;
  /** Expanded branch ids. Bindable: `bind:expandedValue`. */
  expandedValue?: string[];
  /** Branches expanded on first render. */
  defaultExpandedValue?: string[];
  /** Called with the full expanded set whenever a branch opens or closes. */
  onExpandedChange?: (value: string[]) => void;
  /** How many nodes may be selected at once. Defaults to 'single'. */
  selectionMode?: "single" | "multiple";
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Visual treatment. `bordered` draws a container around the tree. Defaults to 'default'. */
  variant?: "default" | "bordered";
  /** Shows the vertical rules that connect a branch to its children. Defaults to true. */
  showIndentGuides?: boolean;
  class?: string;
}
