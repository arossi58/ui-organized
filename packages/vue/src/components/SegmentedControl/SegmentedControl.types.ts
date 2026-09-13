import type { Component } from "vue";
import type { ControlSize } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface SegmentedControlItem {
  /** Unique value reported (and submitted) when this segment is selected. */
  value: string;
  /** Visible label. A string, or a component for anything richer. */
  label: string | Component;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
  /** Disable just this segment. */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Segments to render, left to right. */
  items: SegmentedControlItem[];
  /**
   * Selected value. Use `v-model` for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value` because Ark Vue names the
   * segment-group machine's controlled value for `v-model`; this package follows
   * Ark, the way Listbox, Tabs and RadioGroup already do.
   */
  modelValue?: string;
  /** Uncontrolled initial value. Defaults to the first item's value. */
  defaultValue?: string;
  /** Size. Defaults to 'md'. */
  size?: ControlSize;
  /** Disable the entire control. */
  disabled?: boolean;
  /** Form field name for the underlying radio inputs. */
  name?: string;
  /**
   * Accessible label for the group.
   *
   * Spelled `ariaLabel` — Vue camelises prop names declared through a type, so a
   * prop named `"aria-label"` is never populated. Templates still write
   * `aria-label="..."`.
   */
  ariaLabel?: string;
}
