import { Carousel, type CarouselSlide } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const frame = { width: "100%", maxWidth: 300 };

const tile = (tone: string) => ({
  display: "flex",
  alignItems: "flex-end",
  height: 120,
  padding: "var(--spacing-space-03)",
  background: tone,
  color: "var(--color-content-primary)",
  fontSize: "var(--type-size-body-medium)",
});

const TONES = [
  "var(--color-surface-secondary)",
  "var(--color-interactive-ui-selected)",
  "var(--color-interactive-ui-hover)",
];

function photos(count: number): CarouselSlide[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `slide-${index}`,
    content: <div style={tile(TONES[index % TONES.length]!)}>View {index + 1}</div>,
  }));
}

const MIXED: CarouselSlide[] = [
  { id: "view", content: <div style={tile(TONES[0]!)}>Harbour at dusk</div> },
  {
    id: "terms",
    content: (
      <div style={{ ...tile(TONES[1]!), height: 120, alignItems: "flex-start", fontSize: "var(--type-size-body-small)" }}>
        Prices change without notice. See the full terms for details and exclusions.
      </div>
    ),
  },
  { id: "promo", content: <div style={tile(TONES[2]!)}>Invite your team</div> },
];

export const carouselExamples: UsageExampleSet = {
  controls: {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <Carousel label="Gallery" slides={photos(3)} />
      </div>
    ),
    // No buttons and no dots: nothing says there is more, or how to reach it.
    Dont: () => (
      <div style={frame}>
        <Carousel label="Gallery" slides={photos(3)} variant="minimal" showIndicators={false} />
      </div>
    ),
  },

  "same-kind": {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <Carousel label="Gallery" slides={photos(3)} size="sm" />
      </div>
    ),
    // A picture, then small print, then a sales message: each slide is a new task.
    Dont: () => (
      <div style={frame}>
        <Carousel label="Highlights" slides={MIXED} size="sm" />
      </div>
    ),
  },

  "slide-count": {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <Carousel label="Gallery" slides={photos(4)} size="sm" />
      </div>
    ),
    // Fourteen dots: position is no longer something the reader can take in.
    Dont: () => (
      <div style={frame}>
        <Carousel label="Gallery" slides={photos(14)} size="sm" />
      </div>
    ),
  },
};
