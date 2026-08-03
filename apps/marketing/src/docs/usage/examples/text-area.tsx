import { TextArea } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const SAMPLE =
  "The build fails on the second run only, and always after the cache step. Clearing the cache fixes it until the next deploy.";

export const textAreaExamples: UsageExampleSet = {
  "expected-length": {
    layout: "padded",
    Do: () => <TextArea label="What happened" defaultValue={SAMPLE} rows={4} resize="vertical" />,
    // A paragraph edited through a two-line slot.
    Dont: () => <TextArea label="What happened" defaultValue={SAMPLE} rows={1} resize="vertical" />,
  },

  limits: {
    layout: "padded",
    Do: () => (
      <TextArea
        label="Summary"
        placeholder="One or two sentences"
        helperText="Up to 280 characters."
        rows={3}
        resize="vertical"
      />
    ),
    Dont: () => <TextArea label="Summary" placeholder="One or two sentences" rows={3} />,
  },
};
