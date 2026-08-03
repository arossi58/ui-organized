import { DateTimeInput } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const dateTimeInputExamples: UsageExampleSet = {
  "time-zone": {
    layout: "padded",
    Do: () => (
      <DateTimeInput
        label="Publish at (UTC)"
        defaultValue="2026-09-01T09:00"
        helperText="Stored and run in UTC."
      />
    ),
    // Nine o'clock where, exactly?
    Dont: () => <DateTimeInput label="Publish at" defaultValue="2026-09-01T09:00" />,
  },

  precision: {
    layout: "padded",
    // Quarter-hour steps, matching what the schedule actually honours.
    Do: () => (
      <DateTimeInput label="Run at (UTC)" defaultValue="2026-09-01T09:15" step={900} />
    ),
    Dont: () => <DateTimeInput label="Run at (UTC)" step={1} />,
  },
};
