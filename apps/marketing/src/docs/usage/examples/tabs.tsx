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

  variants: {
    layout: "padded",
    Do: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-space-04)" }}>
        <Tabs
          size="small"
          tabs={[
            { value: "overview", label: "Overview", content: panel("The page's own sections.") },
            { value: "activity", label: "Activity", content: panel("What has happened.") },
          ]}
        />
        <Tabs
          size="small"
          variant="bordered"
          tabs={[
            { value: "chart", label: "Chart", content: panel("A view inside one panel.") },
            { value: "table", label: "Table", content: panel("The same data as rows.") },
          ]}
        />
      </div>
    ),
    // Three looks on one surface, and no way to tell which set is in charge.
    Dont: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-space-04)" }}>
        <Tabs
          size="small"
          variant="pill"
          tabs={[
            { value: "overview", label: "Overview", content: panel("The page's own sections.") },
            { value: "activity", label: "Activity", content: panel("What has happened.") },
          ]}
        />
        <Tabs
          size="small"
          variant="bordered"
          tabs={[
            { value: "chart", label: "Chart", content: panel("A view inside one panel.") },
            { value: "table", label: "Table", content: panel("The same data as rows.") },
          ]}
        />
      </div>
    ),
  },

  counts: {
    layout: "padded",
    Do: () => (
      <Tabs
        size="small"
        variant="pill"
        tabs={[
          { value: "inbox", label: "Inbox", count: 12, content: panel("Twelve unread.") },
          { value: "sent", label: "Sent", content: panel("Messages you sent.") },
          { value: "archive", label: "Archive", content: panel("Older messages.") },
        ]}
      />
    ),
    // A number on every tab, most of which change nothing.
    Dont: () => (
      <Tabs
        size="small"
        variant="pill"
        tabs={[
          { value: "inbox", label: "Inbox", count: 12, content: panel("Twelve unread.") },
          { value: "sent", label: "Sent", count: 340, content: panel("Messages you sent.") },
          { value: "archive", label: "Archive", count: 2048, content: panel("Older messages.") },
        ]}
      />
    ),
  },
};
