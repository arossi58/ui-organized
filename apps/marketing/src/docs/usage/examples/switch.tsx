import { Checkbox, Switch } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const stack = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-03)",
  alignItems: "flex-start",
};

export const switchExamples: UsageExampleSet = {
  "state-label": {
    Do: () => <Switch label="Two-factor authentication" defaultChecked />,
    // Flipped on, the label now describes what turning it off would do.
    Dont: () => <Switch label="Turn off two-factor authentication" defaultChecked />,
  },

  "consistent-list": {
    Do: () => (
      <div style={stack}>
        <Switch label="Desktop notifications" defaultChecked />
        <Switch label="Sound" />
        <Switch label="Weekly digest" defaultChecked />
      </div>
    ),
    Dont: () => (
      <div style={stack}>
        <Switch label="Desktop notifications" defaultChecked />
        <Checkbox label="Sound" />
        <Switch label="Weekly digest" defaultChecked />
      </div>
    ),
  },
};
