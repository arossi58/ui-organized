import { NavItem } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/** A panel behind the items, since nav items are transparent by design. */
const rail = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-01)",
  width: "13rem",
  padding: "var(--spacing-space-03)",
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "var(--border-radius-05)",
  background: "var(--color-surface-secondary)",
};

export const navigationExamples: UsageExampleSet = {
  selected: {
    Do: () => (
      <div style={rail}>
        <NavItem label="Home" icon="home" />
        <NavItem label="Projects" icon="grid" selected />
        <NavItem label="Messages" icon="mail" />
        <NavItem label="Settings" icon="settings" />
      </div>
    ),
    // Nothing says which of these the reader is currently looking at.
    Dont: () => (
      <div style={rail}>
        <NavItem label="Home" icon="home" />
        <NavItem label="Projects" icon="grid" />
        <NavItem label="Messages" icon="mail" />
        <NavItem label="Settings" icon="settings" />
      </div>
    ),
  },

  "plain-names": {
    Do: () => (
      <div style={rail}>
        <NavItem label="Home" icon="home" />
        <NavItem label="Projects" icon="grid" selected />
        <NavItem label="Reports" icon="list" />
        <NavItem label="Settings" icon="settings" />
      </div>
    ),
    Dont: () => (
      <div style={rail}>
        <NavItem label="Home" icon="home" />
        <NavItem label="Core Platform" icon="grid" selected />
        <NavItem label="Insights Engine" icon="list" />
        <NavItem label="Admin Console" icon="settings" />
      </div>
    ),
  },
};
