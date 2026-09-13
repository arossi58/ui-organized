import type * as React from "react";

export interface ProgressProps {
  /** Current value. `null` renders an indeterminate bar. Defaults to null. */
  value?: number | null;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /** Optional label rendered above the track. */
  label?: React.ReactNode;
  /** Whether to show the formatted value beside the label. Defaults to false. */
  showValue?: boolean;
  /** Color variant. Defaults to 'default'. */
  variant?: "default" | "success" | "warning" | "error";
  /** Track thickness. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * Track geometry. `circular` draws a ring instead of a bar — the same value
   * and states, in the shape that fits beside an avatar or inside a tile.
   * Defaults to 'linear'.
   */
  shape?: "linear" | "circular";
  className?: string;
}
