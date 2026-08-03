import { Button, Icon } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const row = { display: "flex", gap: "var(--spacing-space-03)", alignItems: "center" };

const item = {
  display: "flex",
  gap: "var(--spacing-space-02)",
  alignItems: "center",
  color: "var(--color-content-secondary)",
  fontSize: "var(--type-size-body-small)",
};

export const iconExamples: UsageExampleSet = {
  "with-label": {
    Do: () => (
      <div style={row}>
        <Button intent="secondary" size="sm" icon="download">
          Export
        </Button>
        <Button intent="secondary" size="sm" icon="filter">
          Filter
        </Button>
      </div>
    ),
    Dont: () => (
      <div style={row}>
        <Button intent="secondary" size="sm" icon="download" aria-label="Export" />
        <Button intent="secondary" size="sm" icon="filter" aria-label="Filter" />
        <Button intent="secondary" size="sm" icon="bookmark" aria-label="Save view" />
        <Button intent="secondary" size="sm" icon="star" aria-label="Favourite" />
      </div>
    ),
  },

  "one-meaning": {
    Do: () => (
      <div style={row}>
        <span style={item}>
          <Icon name="edit" size={16} /> Edit
        </span>
        <span style={item}>
          <Icon name="settings" size={16} /> Settings
        </span>
      </div>
    ),
    // The same glyph doing two jobs, so neither can be relied on.
    Dont: () => (
      <div style={row}>
        <span style={item}>
          <Icon name="settings" size={16} /> Edit
        </span>
        <span style={item}>
          <Icon name="settings" size={16} /> Settings
        </span>
      </div>
    ),
  },
};
