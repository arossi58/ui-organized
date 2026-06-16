import type * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLElement> {
  /** Shape of the placeholder. Defaults to 'text'. */
  variant?: "text" | "circle" | "rect" | "rounded";
  /** Explicit width — a number is treated as pixels. */
  width?: number | string;
  /** Explicit height — a number is treated as pixels. */
  height?: number | string;
  /** Number of text lines to render (only meaningful for the 'text' variant). Defaults to 1. */
  lines?: number;
  /** Whether to run the shimmer animation. Defaults to true. */
  animated?: boolean;
}
