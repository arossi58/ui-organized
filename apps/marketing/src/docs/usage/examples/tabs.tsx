import { Tabs } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const panel = (text: string) => (
  <p style={{ margin: 0, color: "var(--color-content-secondary)", fontSize: "var(--type-size-body-small)" }}>
    {text}
  </p>
);

export const tabsExamples: UsageExampleSet = {
  "noun-labels": {
    layout: "padded",
    Do: () => (
      <Tabs
        size="small"
        tabs={[
          { value: "overview", label: "Overview", content: panel("What this record is.") },
          { value: "activity", label: "Activity", content: panel("What has happened to it.") },
          { value: "settings", label: "Settings", content: panel("How it behaves.") },
        ]}
      />
    ),
    // Verbs turn a view into something that sounds like it will do something.
    Dont: () => (
      <Tabs
        size="small"
        tabs={[
          { value: "overview", label: "See overview", content: panel("What this record is.") },
          { value: "activity", label: "Check activity", content: panel("What has happened to it.") },
          { value: "settings", label: "Change settings", content: panel("How it behaves.") },
        ]}
      />
    ),
  },

  "small-set": {
    layout: "padded",
    Do: () => (
      <Tabs
        size="small"
        tabs={[
          { value: "overview", label: "Overview", content: panel("What this record is.") },
          { value: "activity", label: "Activity", content: panel("What has happened to it.") },
          { value: "files", label: "Files", content: panel("Everything attached.") },
        ]}
      />
    ),
    Dont: () => (
      <Tabs
        size="small"
        tabs={[
          { value: "overview", label: "Overview", content: panel("What this record is.") },
          { value: "activity", label: "Activity", content: panel("History.") },
          { value: "files", label: "Files", content: panel("Attachments.") },
          { value: "people", label: "People", content: panel("Who has access.") },
          { value: "history", label: "History", content: panel("Older changes.") },
          { value: "audit", label: "Audit", content: panel("Every event.") },
          { value: "settings", label: "Settings", content: panel("Behaviour.") },
          { value: "advanced", label: "Advanced", content: panel("Rarely needed.") },
        ]}
      />
    ),
  },
};
