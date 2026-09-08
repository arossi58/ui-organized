import { NumberField } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const numberFieldExamples: UsageExampleSet = {
  bounds: {
    layout: "padded",
    Do: () => (
      <NumberField
        label="Retention in days"
        defaultValue={30}
        min={1}
        max={90}
        helperText="Between 1 and 90 days."
      />
    ),
    Dont: () => <NumberField label="Retention in days" defaultValue={30} />,
  },

  units: {
    layout: "padded",
    Do: () => <NumberField label="Timeout in seconds" defaultValue={30} min={5} max={120} step={5} />,
    // A bare number: seconds, minutes or attempts, nobody can tell.
    Dont: () => <NumberField label="Timeout" defaultValue={30} />,
  },
};
