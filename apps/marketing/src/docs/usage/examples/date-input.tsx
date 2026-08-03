import { DateInput } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const dateInputExamples: UsageExampleSet = {
  bounds: {
    layout: "padded",
    Do: () => (
      <DateInput
        label="Move-in date"
        min="2026-08-01"
        max="2026-12-31"
        helperText="Any day between August and December 2026."
      />
    ),
    Dont: () => <DateInput label="Move-in date" defaultValue="1998-04-02" />,
  },

  expectations: {
    layout: "padded",
    Do: () => <DateInput label="Delivery date" helperText="Weekdays only, from tomorrow." />,
    // Labelled Date, with the rules waiting to be discovered on submit.
    Dont: () => <DateInput label="Date" />,
  },
};
