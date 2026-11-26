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

  multiple: {
    layout: "padded",
    Do: () => (
      <Combobox
        multiple
        label="Cities"
        options={CITIES}
        placeholder="Start typing a city"
        defaultValue={["amsterdam", "berlin"]}
      />
    ),
    // Every extra value costs another field, and the form grows without end.
    Dont: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Combobox label="City 1" options={CITIES} defaultValue="amsterdam" />
        <Combobox label="City 2" options={CITIES} defaultValue="berlin" />
      </div>
    ),
  },
};
