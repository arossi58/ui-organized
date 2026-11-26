import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface StatProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /** What the number measures: "Revenue", "Active users". */
  label: string;
  /** The number, already formatted for the reader: "$48,260", "1.2k". */
  value: string;
  /** How it has moved, already formatted: "+12.4%", "-3". */
  delta?: string;
  /** Which way it moved. Draws the arrow, and sets the default sentiment. */
  trend?: "up" | "down" | "flat";
  /** Whether the change is good news. Defaults from `trend`; set it where up is bad. */
  sentiment?: "positive" | "negative" | "neutral";
  /** What a screen reader hears before the delta. Defaults to "Increase", "Decrease" or "No change". */
  trendLabel?: string;
  /** What the change is measured against: "vs last month". */
  description?: string;
  /** A small chart under the numbers, such as a sparkline or a Meter. */
  chart?: Snippet;
  /** `card` on a Card's surface, `plain` with no frame. Defaults to 'card'. */
  variant?: "card" | "plain";
  /** Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  class?: string;
}
