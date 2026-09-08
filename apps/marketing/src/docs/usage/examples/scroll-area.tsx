import { ScrollArea } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const ROWS = ["North", "South", "East", "West", "Central", "Coastal", "Northern isles", "Southern reach"];

const rowStyle = {
  padding: "var(--spacing-space-02) var(--spacing-space-03)",
  color: "var(--color-content-secondary)",
  fontSize: "var(--type-size-body-small)",
};

const framed = {
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "var(--border-radius-04)",
  width: "100%",
};

export const scrollAreaExamples: UsageExampleSet = {
  bounded: {
    layout: "padded",
    Do: () => (
      <ScrollArea style={{ ...framed, height: "9rem" }}>
        {ROWS.map((row) => (
          <div key={row} style={rowStyle}>
            {row}
          </div>
        ))}
      </ScrollArea>
    ),
    // No height, so nothing ever scrolls and the list pushes the layout instead.
    Dont: () => (
      <ScrollArea style={framed}>
        {ROWS.map((row) => (
          <div key={row} style={rowStyle}>
            {row}
          </div>
        ))}
      </ScrollArea>
    ),
  },

  "visible-edge": {
    layout: "padded",
    Do: () => (
      <ScrollArea style={{ ...framed, height: "9rem" }}>
        {ROWS.map((row) => (
          <div key={row} style={rowStyle}>
            {row}
          </div>
        ))}
      </ScrollArea>
    ),
    // The same list with no boundary: the cut-off row reads as the last one.
    Dont: () => (
      <ScrollArea style={{ width: "100%", height: "9rem" }}>
        {ROWS.map((row) => (
          <div key={row} style={rowStyle}>
            {row}
          </div>
        ))}
      </ScrollArea>
    ),
  },
};
