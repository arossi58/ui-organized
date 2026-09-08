import { Alert } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const stack = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-03)",
  width: "100%",
};

export const alertExamples: UsageExampleSet = {
  actionable: {
    layout: "padded",
    Do: () => (
      <Alert variant="error" title="Upload failed">
        The file is larger than the 25 MB limit. Split it, or compress it and try again.
      </Alert>
    ),
    Dont: () => (
      <Alert variant="error" title="Error">
        An error was encountered while processing your request.
      </Alert>
    ),
  },

  "one-at-a-time": {
    layout: "padded",
    Do: () => (
      <Alert variant="warning" title="Two fields need attention">
        Fix the highlighted fields below, then save again.
      </Alert>
    ),
    Dont: () => (
      <div style={stack}>
        <Alert variant="warning">The name field is required.</Alert>
        <Alert variant="warning">The date is in the past.</Alert>
        <Alert variant="info">Your draft was saved.</Alert>
      </div>
    ),
  },

  severity: {
    layout: "padded",
    Do: () => (
      <div style={stack}>
        <Alert variant="error">Saving failed. Nothing was written.</Alert>
        <Alert variant="info">A newer version of this record exists.</Alert>
      </div>
    ),
    // Everything at the top tone: the real failure no longer stands out.
    Dont: () => (
      <div style={stack}>
        <Alert variant="error">Saving failed. Nothing was written.</Alert>
        <Alert variant="error">A newer version of this record exists.</Alert>
      </div>
    ),
  },
};
