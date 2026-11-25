import { Calendar } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const calendarExamples: UsageExampleSet = {
  presets: {
    layout: "padded",
    Do: () => (
      <Calendar
        mode="range"
        variant="card"
        defaultValue={{ start: "2026-03-02", end: "2026-03-04" }}
        presets={[
          { label: "Last 7 days", value: "last7Days" },
          { label: "This month", value: "thisMonth" },
          { label: "Last month", value: "lastMonth" },
        ]}
      />
    ),
    // So many shortcuts that scanning them is slower than picking two days.
    Dont: () => (
      <Calendar
        mode="range"
        variant="card"
        defaultValue={{ start: "2026-03-02", end: "2026-03-04" }}
        presets={[
          { label: "Today", value: "today" },
          { label: "Yesterday", value: "yesterday" },
          { label: "Last 3 days", value: "last3Days" },
          { label: "Last 7 days", value: "last7Days" },
          { label: "Last 14 days", value: "last14Days" },
          { label: "Last 30 days", value: "last30Days" },
          { label: "Last 90 days", value: "last90Days" },
          { label: "This week", value: "thisWeek" },
          { label: "Last week", value: "lastWeek" },
          { label: "This month", value: "thisMonth" },
          { label: "Last month", value: "lastMonth" },
          { label: "This year", value: "thisYear" },
        ]}
      />
    ),
  },

  bounded: {
    layout: "padded",
    Do: () => <Calendar variant="card" defaultValue="2026-03-18" min="2026-03-09" max="2026-03-27" />,
    // Every date is offered, including ones the booking cannot take.
    Dont: () => <Calendar variant="card" defaultValue="2026-03-18" />,
  },
};
