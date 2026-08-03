import { Button, Tooltip } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

// Held open rather than opened by default: these are static demonstrations of
// what the bubble says, and a tooltip machine closes an untouched tooltip.
const staged = { layout: "centered" as const, containOverlays: true };

export const tooltipExamples: UsageExampleSet = {
  brief: {
    ...staged,
    Do: () => (
      <Tooltip content="Duplicate" open side="bottom">
        <Button intent="secondary" icon="copy" aria-label="Duplicate" />
      </Tooltip>
    ),
    Dont: () => (
      <Tooltip
        content="Duplicates this item, including its settings and any files attached to it, into the same folder."
        open
        side="bottom"
      >
        <Button intent="secondary" icon="copy" aria-label="Duplicate" />
      </Tooltip>
    ),
  },

  "text-only": {
    ...staged,
    Do: () => (
      <Tooltip content="Removed after 30 days" open side="bottom">
        <Button intent="secondary" icon="trash" aria-label="Delete" />
      </Tooltip>
    ),
    // A control inside a bubble that closes as soon as the pointer leaves the
    // trigger on its way there.
    Dont: () => (
      <Tooltip
        content={
          <span>
            Removed after 30 days.{" "}
            <a href="#retention" style={{ color: "inherit" }}>
              Retention settings
            </a>
          </span>
        }
        open
        side="bottom"
      >
        <Button intent="secondary" icon="trash" aria-label="Delete" />
      </Tooltip>
    ),
  },
};
