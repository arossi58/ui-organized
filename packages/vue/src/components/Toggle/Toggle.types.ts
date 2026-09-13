import type { ControlSize } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface ToggleProps {
  /** Whether the toggle is on (standalone usage). Use `v-model:pressed`. */
  pressed?: boolean;
  /** Initial pressed state for uncontrolled standalone usage. */
  defaultPressed?: boolean;
  /** Identifies this toggle within a `<ToggleGroup>`; turns it into a group item. */
  value?: string;
  /** Whether the toggle should ignore user interaction. */
  disabled?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

export interface ToggleGroupProps {
  /**
   * Pressed values. Use `v-model` for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value` because Ark Vue names the
   * toggle-group machine's controlled value for `v-model`; this package follows
   * Ark, the way Listbox, Tabs and RadioGroup already do.
   */
  modelValue?: string[];
  /** Initial pressed values for uncontrolled usage. */
  defaultValue?: string[];
  /** Allow more than one toggle pressed at once. Defaults to single-select. */
  multiple?: boolean;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Layout orientation. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
}
