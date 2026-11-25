import { Button, Divider } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const column = { display: "flex", flexDirection: "column" as const, width: "100%" };

const row = { display: "flex", gap: "var(--spacing-space-02)", alignItems: "center" };

const text = { margin: 0, color: "var(--color-content-secondary)", fontSize: "var(--type-size-body-small)" };

export const dividerExamples: UsageExampleSet = {
  spacing: {
    layout: "padded",
    Do: () => (
      <div style={column}>
        <p style={text}>Account details</p>
        <Divider spacing="md" />
        <p style={text}>Billing preferences</p>
      </div>
    ),
    // The rule sits against the line above it and floats away from the one below.
    Dont: () => (
      <div style={column}>
        <p style={{ ...text, marginBottom: 0 }}>Account details</p>
        <Divider spacing="none" />
        <p style={{ ...text, marginTop: "var(--spacing-space-06)" }}>Billing preferences</p>
      </div>
    ),
  },

  grouping: {
    Do: () => (
      <div style={row}>
        <Button intent="ghost" size="sm" icon="undo-2" aria-label="Undo" />
        <Button intent="ghost" size="sm" icon="redo-2" aria-label="Redo" />
        <Divider orientation="vertical" />
        <Button intent="ghost" size="sm" icon="list" aria-label="List view" />
        <Button intent="ghost" size="sm" icon="grid-2x2" aria-label="Grid view" />
      </div>
    ),
    Dont: () => (
      <div style={row}>
        <Button intent="ghost" size="sm" icon="undo-2" aria-label="Undo" />
        <Divider orientation="vertical" />
        <Button intent="ghost" size="sm" icon="redo-2" aria-label="Redo" />
        <Divider orientation="vertical" />
        <Button intent="ghost" size="sm" icon="list" aria-label="List view" />
        <Divider orientation="vertical" />
        <Button intent="ghost" size="sm" icon="grid-2x2" aria-label="Grid view" />
      </div>
    ),
  },

  labelled: {
    layout: "padded",
    Do: () => (
      <div style={{ ...column, gap: "var(--spacing-space-02)", maxWidth: 280 }}>
        <Button intent="secondary">Continue with SSO</Button>
        <Divider spacing="sm">or</Divider>
        <Button intent="primary">Continue with email</Button>
      </div>
    ),
    // The label is doing a heading's job, so the section has no real title.
    Dont: () => (
      <div style={{ ...column, maxWidth: 280 }}>
        <Divider spacing="sm" labelPosition="start">Billing preferences</Divider>
        <p style={text}>Statements go to the account owner.</p>
      </div>
    ),
  },
};
