import { Tag } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const row = { display: "flex", gap: "var(--spacing-space-02)", alignItems: "center", flexWrap: "wrap" as const };

export const tagExamples: UsageExampleSet = {
  "short-labels": {
    Do: () => (
      <div style={row}>
        <Tag variant="success">Complete</Tag>
        <Tag variant="caution">Pending</Tag>
        <Tag variant="error">Failed</Tag>
      </div>
    ),
    Dont: () => (
      <div style={row}>
        <Tag variant="caution">Waiting for a reviewer to approve the change</Tag>
      </div>
    ),
  },

  "consistent-variants": {
    Do: () => (
      <div style={row}>
        <Tag variant="success">Active</Tag>
        <Tag variant="success">Active</Tag>
        <Tag variant="caution">Paused</Tag>
      </div>
    ),
    // The same state in two colours: the reader now looks for a difference that
    // isn't there.
    Dont: () => (
      <div style={row}>
        <Tag variant="success">Active</Tag>
        <Tag variant="info">Active</Tag>
        <Tag variant="caution">Paused</Tag>
      </div>
    ),
  },

  "one-emphasis": {
    Do: () => (
      <div style={row}>
        <Tag variant="info">Draft</Tag>
        <Tag variant="success">Published</Tag>
        <Tag variant="caution">Scheduled</Tag>
      </div>
    ),
    Dont: () => (
      <div style={row}>
        <Tag variant="info">Draft</Tag>
        <Tag variant="success" emphasized>
          Published
        </Tag>
        <Tag variant="caution">Scheduled</Tag>
      </div>
    ),
  },
};
