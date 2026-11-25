import { Button, Spinner } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/** A panel the size of the result, so the spinner visibly sits where it will land. */
const panel = {
  display: "grid",
  placeItems: "center",
  width: "100%",
  height: 112,
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "var(--radius-interactive)",
  color: "var(--color-content-tertiary)",
};

const row = { display: "flex", gap: "var(--spacing-space-03)", alignItems: "center" };

export const spinnerExamples: UsageExampleSet = {
  placement: {
    layout: "padded",
    Do: () => (
      <div style={panel}>
        <Spinner size="lg" label="Loading results" />
      </div>
    ),
    Dont: () => (
      <div style={{ ...panel, placeItems: "start end", padding: "var(--spacing-space-02)" }}>
        <Spinner size="sm" label="Loading results" />
      </div>
    ),
  },

  "in-button": {
    Do: () => (
      <div style={row}>
        <Button intent="primary" loading>
          Publishing
        </Button>
      </div>
    ),
    Dont: () => (
      <div style={row}>
        <Button intent="primary" disabled>
          Publish
        </Button>
        <Spinner size="sm" label="Publishing" />
      </div>
    ),
  },
};
