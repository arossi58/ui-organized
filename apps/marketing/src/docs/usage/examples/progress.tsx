import { Progress } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const progressExamples: UsageExampleSet = {
  labelled: {
    layout: "padded",
    Do: () => <Progress label="Importing records" value={40} showValue />,
    Dont: () => <Progress value={40} />,
  },

  indeterminate: {
    layout: "padded",
    // `null` is the honest answer while the server hasn't reported a size.
    Do: () => <Progress label="Preparing export" value={null} />,
    Dont: () => <Progress label="Preparing export" value={73} showValue />,
  },
};
