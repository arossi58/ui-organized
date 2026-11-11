import { Marquee } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const word = {
  fontFamily: "var(--type-font-body)",
  fontSize: "var(--type-size-body-large)",
  fontWeight: "var(--type-weight-body-emphasis)",
  color: "var(--color-content-secondary)",
  whiteSpace: "nowrap" as const,
};

const toItems = (labels: string[]) =>
  labels.map((label) => ({ id: label, content: <span style={word}>{label}</span> }));

const NAMES = toItems(["Northwind", "Brightline", "Harbor", "Quarry", "Lumen", "Fieldstone"]);

const SENTENCES = toItems([
  "Our spring release adds offline editing to every workspace.",
  "Scheduled maintenance runs on Saturday from two until four.",
  "New export options are now available in account settings.",
]);

/* Paused in every example, so each card holds one stable frame. */
export const marqueeExamples: UsageExampleSet = {
  "faded-edges": {
    layout: "padded",
    Do: () => <Marquee items={NAMES} defaultPaused />,
    // Without the fades, items are chopped mid-word at both ends of the track.
    Dont: () => <Marquee items={NAMES} defaultPaused showEdges={false} />,
  },

  "glanceable-items": {
    layout: "padded",
    Do: () => <Marquee items={NAMES} defaultPaused />,
    // Sentences scroll away before anyone can finish reading them.
    Dont: () => <Marquee items={SENTENCES} defaultPaused />,
  },
};
