import type * as React from "react";

export interface MarqueeItem {
  /** Unique id across the marquee. */
  id: string;
  /** Item contents. */
  content: React.ReactNode;
}

export interface MarqueeProps {
  /** The items to scroll, in order. */
  items: MarqueeItem[];
  /** Pixels travelled per second. Higher is faster. Defaults to 50. */
  speed?: number;
  /** Seconds to wait before the first pass. Defaults to 0. */
  delay?: number;
  /** Scroll direction. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Reverses the travel direction. Defaults to false. */
  reverse?: boolean;
  /** Gap between items. Defaults to the space-04 token. */
  spacing?: string;
  /** Repeats the content until the track is full, so there is never a gap. Defaults to true. */
  autoFill?: boolean;
  /** Pauses while hovered or focused. Defaults to false. */
  pauseOnInteraction?: boolean;
  /** Starts paused. Useful for reduced-motion and for deterministic snapshots. Defaults to false. */
  defaultPaused?: boolean;
  /** Number of passes before stopping. 0 scrolls forever. Defaults to 0. */
  loopCount?: number;
  /** Fades the leading and trailing edges into the background. Defaults to true. */
  showEdges?: boolean;
  className?: string;
}
