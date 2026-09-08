import { Range } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const rangeExamples: UsageExampleSet = {
  "labelled-ends": {
    layout: "padded",
    Do: () => (
      <Range
        label="Volume"
        defaultValue={40}
        rangeLabels
        startLabel="Quiet"
        endLabel="Loud"
      />
    ),
    Dont: () => <Range defaultValue={40} hideValue />,
  },

  steps: {
    layout: "padded",
    // Five stops the system can actually store.
    Do: () => <Range label="Quality" defaultValue={50} step={25} rangeLabels />,
    Dont: () => <Range label="Quality" defaultValue={47} step={1} rangeLabels />,
  },
};
