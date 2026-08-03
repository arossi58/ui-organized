import { SegmentedControl } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const segmentedControlExamples: UsageExampleSet = {
  "short-labels": {
    Do: () => (
      <SegmentedControl
        aria-label="Range"
        defaultValue="week"
        items={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />
    ),
    Dont: () => (
      <SegmentedControl
        aria-label="Range"
        defaultValue="week"
        items={[
          { value: "day", label: "Just today" },
          { value: "week", label: "The past seven days" },
          { value: "month", label: "The past calendar month" },
        ]}
      />
    ),
  },

  parallel: {
    Do: () => (
      <SegmentedControl
        aria-label="Status filter"
        defaultValue="active"
        items={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ]}
      />
    ),
    // The last segment runs something instead of filtering, so selection stops
    // meaning one thing.
    Dont: () => (
      <SegmentedControl
        aria-label="Status filter"
        defaultValue="active"
        items={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "export", label: "Export" },
        ]}
      />
    ),
  },
};
