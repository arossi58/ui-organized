import { Combobox } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const CITIES = [
  { value: "amsterdam", label: "Amsterdam" },
  { value: "auckland", label: "Auckland" },
  { value: "austin", label: "Austin" },
  { value: "bogota", label: "Bogotá" },
  { value: "berlin", label: "Berlin" },
];

export const comboboxExamples: UsageExampleSet = {
  "invite-typing": {
    layout: "padded",
    Do: () => <Combobox label="City" options={CITIES} placeholder="Start typing a city" />,
    // Reads as a dropdown, so nobody discovers that typing narrows it.
    Dont: () => <Combobox label="City" options={CITIES} placeholder="Select an option" />,
  },

  scope: {
    layout: "padded",
    Do: () => (
      <Combobox
        label="City"
        options={CITIES}
        placeholder="Start typing a city"
        helperText="Cities where next-day delivery runs."
      />
    ),
    Dont: () => (
      <Combobox label="City" options={CITIES} placeholder="Start typing a city" />
    ),
  },
};
