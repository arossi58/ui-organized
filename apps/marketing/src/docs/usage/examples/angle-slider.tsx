import { AngleSlider } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const QUARTER_TURNS = [0, 90, 180, 270];

export const angleSliderExamples: UsageExampleSet = {
  "show-value": {
    Do: () => <AngleSlider label="Rotation" defaultValue={135} />,
    // Somewhere past ninety degrees; the reader has to guess the number.
    Dont: () => <AngleSlider label="Rotation" defaultValue={135} showValue={false} />,
  },

  markers: {
    Do: () => <AngleSlider label="Bearing" defaultValue={90} markers={QUARTER_TURNS} />,
    // No ticks on the ring, so a quarter turn has to be found by eye.
    Dont: () => <AngleSlider label="Bearing" defaultValue={90} />,
  },
};
