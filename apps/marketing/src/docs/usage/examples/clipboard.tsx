import { Clipboard } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const LINK = "https://example.com/invite/7f3k29";

export const clipboardExamples: UsageExampleSet = {
  labelled: {
    layout: "padded",
    Do: () => <Clipboard label="Invite link" value={LINK} />,
    // Nothing says what this string is or where it is meant to go.
    Dont: () => <Clipboard value={LINK} />,
  },

  "show-value": {
    layout: "padded",
    Do: () => <Clipboard label="Recovery code" value="4KQ9-XT2M-88PL" />,
    // The reader copies something they never get to see or check.
    Dont: () => <Clipboard variant="button" value="4KQ9-XT2M-88PL" />,
  },

  "trigger-label": {
    Do: () => <Clipboard variant="button" value={LINK} />,
    // A sentence on the trigger, which reflows when it swaps to the confirmation.
    Dont: () => (
      <Clipboard
        variant="button"
        value={LINK}
        copyLabel="Click here to copy this link"
        copiedLabel="Done"
      />
    ),
  },
};
