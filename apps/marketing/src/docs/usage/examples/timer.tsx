import { Timer } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/* Fixed start values and no autoStart, so both halves render one stable frame. */
const FIVE_MINUTES = 5 * 60 * 1000;
const THREE_DAYS = 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 30 * 60 * 1000;

export const timerExamples: UsageExampleSet = {
  "fitting-units": {
    Do: () => <Timer parts={["minutes", "seconds"]} startMs={FIVE_MINUTES} countdown />,
    // Days and hours sit at zero for the whole count and only add noise.
    Dont: () => (
      <Timer
        parts={["days", "hours", "minutes", "seconds"]}
        startMs={FIVE_MINUTES}
        countdown
      />
    ),
  },

  "unit-labels": {
    Do: () => (
      <Timer
        parts={["days", "hours", "minutes"]}
        startMs={THREE_DAYS}
        countdown
        variant="boxed"
        showLabels
      />
    ),
    // Three bare numbers read as hours, minutes and seconds, not days, hours and minutes.
    Dont: () => (
      <Timer parts={["days", "hours", "minutes"]} startMs={THREE_DAYS} countdown variant="boxed" />
    ),
  },
};
