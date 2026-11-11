import { Chip } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const row = {
  display: "flex",
  gap: "var(--spacing-space-02)",
  alignItems: "center",
  flexWrap: "wrap" as const,
  maxWidth: 300,
};

export const chipExamples: UsageExampleSet = {
  phrase: {
    Do: () => (
      <div style={row}>
        <Chip label="Role" operator="is any of" value="Admin, Owner, Editor" />
      </div>
    ),
    // One undifferentiated string: nothing marks the field, and it all reads as the value.
    Dont: () => (
      <div style={row}>
        <Chip value="Role is any of Admin, Owner, Editor" />
      </div>
    ),
  },

  incomplete: {
    Do: () => (
      <div style={row}>
        <Chip label="Role" operator="is any of" value="Admin" />
        <Chip label="Status" operator="is" value="Choose a value" incomplete />
      </div>
    ),
    // The unfinished filter looks exactly like the one that is applied.
    Dont: () => (
      <div style={row}>
        <Chip label="Role" operator="is any of" value="Admin" />
        <Chip label="Status" operator="is" value="Choose a value" />
      </div>
    ),
  },
};
