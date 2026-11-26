import type * as React from "react";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** What the number measures: "Revenue", "Active users". */
  label: React.ReactNode;
  /** The number, already formatted for the reader: "$48,260", "1.2k". */
  value: React.ReactNode;
  /** How it has moved, already formatted: "+12.4%", "-3". */
  delta?: React.ReactNode;
  /** Which way it moved. Draws the arrow, and sets the default sentiment. */
  trend?: "up" | "down" | "flat";
  /**
   * Whether the change is good news. Defaults from `trend`: up is positive,
   * down negative. Set it for a number where up is bad, such as a refund rate.
   */
  sentiment?: "positive" | "negative" | "neutral";
  /** What a screen reader hears before the delta. Defaults to "Increase", "Decrease" or "No change". */
  trendLabel?: string;
  /** What the change is measured against: "vs last month". */
  description?: React.ReactNode;
  /** A small chart under the numbers, such as a sparkline or a Meter. */
  chart?: React.ReactNode;
  /** `card` on a Card's surface, `plain` with no frame. Defaults to 'card'. */
  variant?: "card" | "plain";
  /** Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
}
