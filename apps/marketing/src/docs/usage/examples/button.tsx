import { Button } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/** Two or three buttons is the whole demonstration — anything more is a page. */
const row = { display: "flex", gap: "var(--spacing-space-03)", alignItems: "center" };

export const buttonExamples: UsageExampleSet = {
  emphasis: {
    Do: () => (
      <div style={row}>
        <Button intent="primary">Save changes</Button>
        <Button intent="secondary">Cancel</Button>
      </div>
    ),
    Dont: () => (
      <div style={row}>
        <Button intent="primary">Save changes</Button>
        <Button intent="primary">Cancel</Button>
      </div>
    ),
  },

  labels: {
    Do: () => (
      <div style={row}>
        <Button intent="destructive">Delete file</Button>
        <Button intent="secondary">Keep file</Button>
      </div>
    ),
    Dont: () => (
      <div style={row}>
        <Button intent="destructive">Yes</Button>
        <Button intent="secondary">No</Button>
      </div>
    ),
  },

  "icon-only": {
    Do: () => (
      <div style={row}>
        <Button intent="secondary" icon="plus">
          Add item
        </Button>
      </div>
    ),
    Dont: () => (
      <div style={row}>
        {/* Labelled for assistive technology even here: the failure being shown
            is that nothing on screen says what the glyph does, and staging an
            actual unlabelled control would make this page's own audit lie. */}
        <Button intent="secondary" icon="plus" aria-label="Add item" />
      </div>
    ),
  },
};
