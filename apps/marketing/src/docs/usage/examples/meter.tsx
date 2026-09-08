import { Meter } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const stack = { display: "flex", flexDirection: "column" as const, gap: "var(--spacing-space-05)" };

export const meterExamples: UsageExampleSet = {
  labelled: {
    layout: "padded",
    Do: () => <Meter label="Storage used" value={68} showValue />,
    // Named for assistive technology, unlabelled on screen — the failure being
    // shown is the missing caption, not a missing accessible name.
    Dont: () => <Meter aria-label="Storage used" value={68} />,
  },

  "fixed-range": {
    layout: "padded",
    Do: () => (
      <div style={stack}>
        <Meter label="Group A" value={42} max={100} showValue />
        <Meter label="Group B" value={76} max={100} showValue />
      </div>
    ),
    Dont: () => (
      <div style={stack}>
        <Meter label="Group A" value={42} max={42} showValue />
        <Meter label="Group B" value={76} max={76} showValue />
      </div>
    ),
  },

  threshold: {
    layout: "padded",
    Do: () => <Meter label="Capacity: over limit" value={92} variant="error" showValue />,
    Dont: () => <Meter label="Capacity" value={92} variant="error" />,
  },
};
