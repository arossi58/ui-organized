import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface SegmentedControlItem {
  /** Unique value reported (and submitted) when this segment is selected. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
  /** Disable just this segment. */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Segments to render, left to right. */
  items: SegmentedControlItem[];
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. Defaults to the first item's value. */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** Size. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Disable the entire control. */
  disabled?: boolean;
  /** Form field name for the underlying radio inputs. */
  name?: string;
  /** Accessible label for the group. */
  "aria-label"?: string;
  className?: string;
}
