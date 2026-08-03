import { Input } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const row = {
  display: "flex",
  gap: "var(--spacing-space-04)",
  alignItems: "flex-start",
  width: "100%",
};

export const inputExamples: UsageExampleSet = {
  labelled: {
    layout: "padded",
    Do: () => <Input label="Full name" placeholder="Ada Lovelace" />,
    // The only thing naming this field disappears as soon as anyone types.
    Dont: () => <Input placeholder="Full name" />,
  },

  "helper-first": {
    layout: "padded",
    Do: () => (
      <Input
        label="Workspace URL"
        placeholder="my-team"
        helperText="Lowercase letters, numbers and hyphens."
      />
    ),
    Dont: () => <Input label="Workspace URL" defaultValue="My Team!" error="Invalid value." />,
  },

  "sized-to-content": {
    layout: "padded",
    Do: () => (
      <div style={row}>
        <div style={{ width: "6rem" }}>
          <Input label="Postcode" placeholder="SW1A" />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Street" placeholder="12 Example Street" />
        </div>
      </div>
    ),
    Dont: () => (
      <div style={{ ...row, flexDirection: "column" }}>
        <Input label="Postcode" placeholder="SW1A" />
        <Input label="Street" placeholder="12 Example Street" />
      </div>
    ),
  },
};
