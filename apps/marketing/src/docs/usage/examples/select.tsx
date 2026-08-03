import { Select } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const REGIONS = [
  { value: "eu-west", label: "Europe (west)" },
  { value: "us-east", label: "North America (east)" },
  { value: "ap-south", label: "Asia Pacific (south)" },
];

export const selectExamples: UsageExampleSet = {
  labelled: {
    layout: "padded",
    Do: () => <Select label="Region" options={REGIONS} placeholder="Select a region" />,
    // The name of the field vanishes the moment anything is chosen.
    Dont: () => <Select options={REGIONS} placeholder="Region" />,
  },

  "helper-vs-error": {
    layout: "padded",
    Do: () => (
      <Select
        label="Region"
        options={REGIONS}
        placeholder="Select a region"
        helperText="Data stays in the region you pick and can't be moved later."
      />
    ),
    Dont: () => (
      <Select
        label="Region"
        options={REGIONS}
        placeholder="Select a region"
        error="Invalid selection."
      />
    ),
  },
};
