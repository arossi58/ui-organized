import { Toggle, ToggleGroup } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const row = { display: "flex", gap: "var(--spacing-space-03)", alignItems: "center" };

export const toggleExamples: UsageExampleSet = {
  "stable-label": {
    Do: () => (
      <div style={row}>
        <Toggle defaultPressed>Details</Toggle>
      </div>
    ),
    // The label reports the action instead of the state, so pressed and
    // unpressed read as two different controls.
    Dont: () => (
      <div style={row}>
        <Toggle defaultPressed>Hide details</Toggle>
      </div>
    ),
  },

  grouped: {
    Do: () => (
      <ToggleGroup defaultValue={["grid"]}>
        <Toggle value="list" icon="list" aria-label="List view" />
        <Toggle value="grid" icon="grid" aria-label="Grid view" />
      </ToggleGroup>
    ),
    Dont: () => (
      <div style={row}>
        <Toggle defaultPressed icon="list" aria-label="List view" />
        <Toggle defaultPressed icon="grid" aria-label="Grid view" />
      </div>
    ),
  },
};
