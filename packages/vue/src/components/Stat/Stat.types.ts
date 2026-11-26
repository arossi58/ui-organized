/** Slot: `chart`, a small chart under the numbers. */
export interface StatProps {
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
  /** `card` on a Card's surface, `plain` with no frame. Defaults to 'card'. */
  variant?: "card" | "plain";
  /** Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
}
