import { Avatar } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const PEOPLE = ["Ada Lovelace", "Grace Hopper", "Alan Turing"];

const list = { display: "flex", flexDirection: "column" as const, gap: "var(--spacing-space-03)" };

const person = { display: "flex", gap: "var(--spacing-space-03)", alignItems: "center" };

const row = { display: "flex", gap: "var(--spacing-space-02)", alignItems: "center" };

const name = { color: "var(--color-content-primary)", fontSize: "var(--type-size-body-small)" };

export const avatarExamples: UsageExampleSet = {
  "with-name": {
    layout: "padded",
    Do: () => (
      <div style={list}>
        {PEOPLE.map((who) => (
          <div key={who} style={person}>
            <Avatar name={who} size="sm" />
            <span style={name}>{who}</span>
          </div>
        ))}
      </div>
    ),
    // Three sets of initials, identifying nobody.
    Dont: () => (
      <div style={row}>
        {PEOPLE.map((who) => (
          <Avatar key={who} name={who} size="sm" />
        ))}
      </div>
    ),
  },

  fallback: {
    Do: () => (
      <div style={row}>
        <Avatar name="Ada Lovelace" size="md" />
        <Avatar name="Grace Hopper" size="md" />
      </div>
    ),
    // No name to fall back on when the image is missing.
    Dont: () => (
      <div style={row}>
        <Avatar size="md" />
        <Avatar size="md" />
      </div>
    ),
  },
};
