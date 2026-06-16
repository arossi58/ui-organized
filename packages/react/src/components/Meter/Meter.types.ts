import type * as React from "react";

export interface MeterProps {
  /** The current value. Required — a meter always shows a concrete measurement. */
  value: number;
  /** Minimum value. Defaults to 0. */
  min?: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /** Optional label rendered above the track. */
  label?: React.ReactNode;
  /** Whether to show the formatted value beside the label. Defaults to false. */
  showValue?: boolean;
  /** Options to format the displayed value (e.g. `{ style: "percent" }`). */
  format?: Intl.NumberFormatOptions;
  /** Color variant. Defaults to 'default'. */
  variant?: "default" | "success" | "warning" | "error";
  /** Track thickness. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  className?: string;
}
