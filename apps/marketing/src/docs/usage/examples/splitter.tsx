import { Splitter } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const pane = (label: string, background = "var(--color-surface-secondary)") => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      background,
      color: "var(--color-content-secondary)",
      fontFamily: "var(--type-font-body)",
      fontSize: "var(--type-size-body-medium)",
    }}
  >
    {label}
  </div>
);

const frame = { width: "100%", height: 140 };

const LIST_AND_DETAIL = [
  { id: "list", label: "List", content: pane("List"), minSize: 20 },
  { id: "detail", label: "Detail", content: pane("Detail"), minSize: 40 },
];

const FLAT = [
  { id: "list", label: "List", content: pane("List", "var(--color-surface-primary)") },
  { id: "detail", label: "Detail", content: pane("Detail", "var(--color-surface-primary)") },
];

export const splitterExamples: UsageExampleSet = {
  proportions: {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <Splitter panels={LIST_AND_DETAIL} defaultSize={[30, 70]} />
      </div>
    ),
    // An even split hands the narrow list as much room as the detail it drives.
    Dont: () => (
      <div style={frame}>
        <Splitter panels={LIST_AND_DETAIL} />
      </div>
    ),
  },

  "visible-handle": {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <Splitter panels={FLAT} defaultSize={[40, 60]} />
      </div>
    ),
    // On one flat surface, a hidden rule leaves nothing to say there are two panes.
    Dont: () => (
      <div style={frame}>
        <Splitter panels={FLAT} defaultSize={[40, 60]} variant="subtle" />
      </div>
    ),
  },
};
