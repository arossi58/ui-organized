import { Alert, FieldError, Input } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const form = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-04)",
  width: "100%",
};

const field = { display: "flex", flexDirection: "column" as const, gap: "var(--spacing-space-02)" };

export const fieldErrorExamples: UsageExampleSet = {
  specific: {
    layout: "padded",
    Do: () => (
      <div style={field}>
        <Input label="Start date" defaultValue="2020-01-01" />
        <FieldError>Choose a date in the future.</FieldError>
      </div>
    ),
    Dont: () => (
      <div style={field}>
        <Input label="Start date" defaultValue="2020-01-01" />
        <FieldError>Validation failed: date.min</FieldError>
      </div>
    ),
  },

  "in-place": {
    layout: "padded",
    Do: () => (
      <div style={form}>
        <div style={field}>
          <Input label="Start date" defaultValue="2020-01-01" />
          <FieldError>Choose a date in the future.</FieldError>
        </div>
        <Input label="Reference" placeholder="ABC-123" />
      </div>
    ),
    // The message is at the top; the field that caused it is somewhere below.
    Dont: () => (
      <div style={form}>
        <Alert variant="error">One field needs attention.</Alert>
        <Input label="Start date" defaultValue="2020-01-01" />
        <Input label="Reference" placeholder="ABC-123" />
      </div>
    ),
  },
};
