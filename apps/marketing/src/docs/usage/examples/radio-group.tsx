import { RadioGroup } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const SPEED = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "same-day", label: "Same day" },
];

const WORDY = [
  { value: "standard", label: "Standard, arriving in three to five days" },
  { value: "express", label: "Express, arriving the next working day" },
  { value: "same-day", label: "Same day, where the service is available" },
];

export const radioGroupExamples: UsageExampleSet = {
  "group-label": {
    layout: "padded",
    Do: () => <RadioGroup label="Delivery speed" options={SPEED} defaultValue="standard" />,
    Dont: () => <RadioGroup options={SPEED} defaultValue="standard" />,
  },

  orientation: {
    layout: "padded",
    Do: () => (
      <RadioGroup
        label="Delivery speed"
        options={SPEED}
        defaultValue="standard"
        orientation="horizontal"
      />
    ),
    // Long labels in a row: the eye can no longer tell where one option ends.
    Dont: () => (
      <RadioGroup
        label="Delivery speed"
        options={WORDY}
        defaultValue="standard"
        orientation="horizontal"
      />
    ),
  },
};
