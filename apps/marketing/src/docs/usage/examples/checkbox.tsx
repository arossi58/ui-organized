import { Checkbox } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const stack = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-02)",
  alignItems: "flex-start",
};

const nested = { ...stack, paddingLeft: "var(--spacing-space-05)" };

export const checkboxExamples: UsageExampleSet = {
  "positive-label": {
    Do: () => <Checkbox label="Send weekly summaries" defaultChecked />,
    // Clearing the box now means "do send them", which is a double negative.
    Dont: () => <Checkbox label="Don't send weekly summaries" />,
  },

  indeterminate: {
    Do: () => (
      <div style={stack}>
        <Checkbox label="All regions" indeterminate />
        <div style={nested}>
          <Checkbox label="North" defaultChecked />
          <Checkbox label="South" />
        </div>
      </div>
    ),
    Dont: () => (
      <div style={stack}>
        <Checkbox label="All regions" defaultChecked />
        <div style={nested}>
          <Checkbox label="North" defaultChecked />
          <Checkbox label="South" />
        </div>
      </div>
    ),
  },
};
