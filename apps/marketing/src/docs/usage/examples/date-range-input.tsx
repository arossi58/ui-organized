import { DateInput, DateRangeInput } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const stack = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-03)",
  width: "100%",
};

const RANGE = { start: "2026-06-15", end: "2026-06-22" };

export const dateRangeInputExamples: UsageExampleSet = {
  "one-value": {
    layout: "padded",
    Do: () => (
      <DateRangeInput
        label="Reporting period"
        defaultValue={RANGE}
        helperText="Both ends are included."
      />
    ),
    // Two fields, two labels, two messages, for one value.
    Dont: () => (
      <div style={stack}>
        <DateInput label="Start date" defaultValue={RANGE.start} />
        <DateInput label="End date" defaultValue={RANGE.end} />
      </div>
    ),
  },

  bounded: {
    layout: "padded",
    Do: () => (
      <DateRangeInput
        label="Reporting period"
        defaultValue={RANGE}
        min="2026-01-01"
        max="2026-12-31"
        helperText="Within the current year."
      />
    ),
    Dont: () => (
      <DateRangeInput
        label="Reporting period"
        defaultValue={{ start: "2026-06-22", end: "2026-06-15" }}
        error="End date must be on or after the start date."
      />
    ),
  },

  presets: {
    layout: "padded",
    Do: () => (
      <DateRangeInput
        label="Reporting period"
        presets={[
          { label: "Last 7 days", value: "last7Days" },
          { label: "Last 30 days", value: "last30Days" },
          { label: "This month", value: "thisMonth" },
          { label: "Last month", value: "lastMonth" },
        ]}
        helperText="Open the calendar for common periods."
      />
    ),
    // Every reader picks two ends by hand for a period most of them want.
    Dont: () => <DateRangeInput label="Reporting period" helperText="Pick a start and an end." />,
  },
};
