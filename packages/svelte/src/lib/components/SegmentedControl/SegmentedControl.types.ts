import type { Snippet } from "svelte";
import type { ControlSize } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface SegmentedControlItem {
  /** Unique value reported (and submitted) when this segment is selected. */
  value: string;
  /**
   * Visible label. A string, or a snippet for anything richer.
   *
   * React takes a ReactNode here, which can be either. Svelte has no single type
   * that covers both, so the union is explicit and the component renders
   * whichever it was given.
   */
  label: string | Snippet;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
  /** Disable just this segment. */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Segments to render, left to right. */
  items: SegmentedControlItem[];
  /** Selected value. Bindable: `bind:value`. */
  value?: string;
  /** Uncontrolled initial value. Defaults to the first item's value. */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** Size. Defaults to 'md'. */
  size?: ControlSize;
  /** Disable the entire control. */
  disabled?: boolean;
  /** Form field name for the underlying radio inputs. */
  name?: string;
  /** Accessible label for the group. */
  "aria-label"?: string;
  class?: string;
}
