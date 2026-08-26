import type { Component } from "vue";
import type { ControlSize } from "@ui-organized/core";

export interface ProgressProps {
  /** Current value. `null` renders an indeterminate bar. Defaults to null. */
  value?: number | null;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /**
   * Optional label rendered above the track.
   *
   * A string, or a component for anything richer. React takes a ReactNode here;
   * Vue has no single type covering both, so the union is explicit and the
   * component renders whichever it was given.
   */
  label?: string | Component;
  /** Whether to show the formatted value beside the label. Defaults to false. */
  showValue?: boolean;
  /** Color variant. Defaults to 'default'. */
  variant?: "default" | "success" | "warning" | "error";
  /** Track thickness. Defaults to 'md'. */
  size?: ControlSize;
  /**
   * Track geometry. `circular` draws a ring instead of a bar. Defaults to 'linear'.
   */
  shape?: "linear" | "circular";
}
