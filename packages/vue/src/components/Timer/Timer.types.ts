import type { ControlSize } from "@ui-organized/core";

export type TimerPart = "days" | "hours" | "minutes" | "seconds" | "milliseconds";

export interface TimerProps {
  /**
   * Which units to display, in order. Defaults to
   * `["hours", "minutes", "seconds"]`.
   */
  parts?: TimerPart[];
  /** Counts down to `targetMs` instead of up from it. Defaults to false. */
  countdown?: boolean;
  /** Where the timer starts, in milliseconds. */
  startMs?: number;
  /** Where the timer stops, in milliseconds. */
  targetMs?: number;
  /** Starts as soon as it mounts. Defaults to false. */
  autoStart?: boolean;
  /** Milliseconds between ticks. Lower this to show milliseconds. Defaults to 1000. */
  interval?: number;
  /** Renders start / pause / reset buttons. Defaults to false. */
  showControls?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Visual treatment. `boxed` puts each unit on its own tile. Defaults to 'default'. */
  variant?: "default" | "boxed";
  /** Shows the unit name under each value. Defaults to false. */
  showLabels?: boolean;
}
