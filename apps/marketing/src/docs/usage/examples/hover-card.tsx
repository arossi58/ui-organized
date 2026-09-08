import { Avatar, HoverCard, HoverCardContent, HoverCardTrigger } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const staged = { layout: "centered" as const, containOverlays: true };

const preview = {
  display: "flex",
  gap: "var(--spacing-space-03)",
  alignItems: "center",
  maxWidth: "16rem",
};

const meta = {
  margin: 0,
  color: "var(--color-content-secondary)",
  fontSize: "var(--type-size-body-small)",
};

const sentence = { maxWidth: "18rem", color: "var(--color-content-secondary)" };

/** One previewable reference inside a sentence. */
function Reference({ name, open = false }: { name: string; open?: boolean }) {
  return (
    <HoverCard open={open || undefined}>
      <HoverCardTrigger>{name}</HoverCardTrigger>
      <HoverCardContent>
        <span style={meta}>A short summary of {name}.</span>
      </HoverCardContent>
    </HoverCard>
  );
}

export const hoverCardExamples: UsageExampleSet = {
  summary: {
    ...staged,
    Do: () => (
      <HoverCard open>
        <HoverCardTrigger>Ada Lovelace</HoverCardTrigger>
        <HoverCardContent>
          <div style={preview}>
            <Avatar name="Ada Lovelace" size="md" />
            <div style={{ display: "grid", gap: "var(--spacing-space-01)" }}>
              <strong>Ada Lovelace</strong>
              <span style={meta}>Maintainer. Joined 2021.</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    ),
    // The whole record in a card that appears when a pointer passes by.
    Dont: () => (
      <HoverCard open>
        <HoverCardTrigger>Ada Lovelace</HoverCardTrigger>
        <HoverCardContent>
          <div style={{ maxWidth: "16rem", display: "grid", gap: "var(--spacing-space-01)" }}>
            <strong>Ada Lovelace</strong>
            <span style={meta}>Maintainer. Joined 2021.</span>
            <span style={meta}>Time zone UTC. Working hours 09:00 to 17:00.</span>
            <span style={meta}>Owns 14 projects, 3 of them shared with your team.</span>
            <span style={meta}>Last active two hours ago from a desktop session.</span>
          </div>
        </HoverCardContent>
      </HoverCard>
    ),
  },

  sparing: {
    ...staged,
    // A `div` rather than a `p`: a contained overlay renders inside its trigger's
    // parent, and a preview card is not valid inside a paragraph.
    Do: () => (
      <div style={sentence}>
        Reviewed by{" "}
        <HoverCard open>
          <HoverCardTrigger>Ada Lovelace</HoverCardTrigger>
          <HoverCardContent>
            <div style={preview}>
              <Avatar name="Ada Lovelace" size="sm" />
              <span style={meta}>Maintainer. Joined 2021.</span>
            </div>
          </HoverCardContent>
        </HoverCard>{" "}
        on the release branch.
      </div>
    ),
    // Four previewable references in one sentence: every pass of the pointer
    // opens something.
    Dont: () => (
      <div style={sentence}>
        Reviewed by <Reference name="Ada Lovelace" open /> on the{" "}
        <Reference name="release branch" /> after the <Reference name="nightly build" />, which
        followed the <Reference name="migration" />.
      </div>
    ),
  },
};
