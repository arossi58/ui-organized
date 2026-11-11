import { ColorPicker } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const stack = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-03)",
  alignItems: "flex-start",
};

export const colorPickerExamples: UsageExampleSet = {
  "value-text": {
    containOverlays: true,
    Do: () => (
      <div style={stack}>
        <ColorPicker label="Accent color" format="hex" defaultValue="#2563eb" />
        <ColorPicker label="Link color" format="hex" defaultValue="#2b5fe0" />
      </div>
    ),
    // Two blues a few units apart; without the values nobody can tell them apart.
    Dont: () => (
      <div style={stack}>
        <ColorPicker label="Accent color" variant="swatch-only" defaultValue="#2563eb" />
        <ColorPicker label="Link color" variant="swatch-only" defaultValue="#2b5fe0" />
      </div>
    ),
  },

  labelled: {
    containOverlays: true,
    Do: () => <ColorPicker label="Accent color" variant="swatch-only" defaultValue="#2563eb" />,
    // A colored square with no name: accent, text, background?
    Dont: () => <ColorPicker variant="swatch-only" defaultValue="#2563eb" />,
  },
};
