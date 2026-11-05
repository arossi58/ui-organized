import { PinInput } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const pinInputExamples: UsageExampleSet = {
  "matching-length": {
    Do: () => (
      <PinInput
        label="Verification code"
        helperText="We sent a 6-digit code to your email."
        length={6}
        defaultValue="4821"
      />
    ),
    // Four cells for a six-digit code: the last two digits have nowhere to go.
    Dont: () => (
      <PinInput
        label="Verification code"
        helperText="We sent a 6-digit code to your email."
        defaultValue="4821"
      />
    ),
  },

  labelled: {
    Do: () => <PinInput label="Code from your authenticator app" length={6} />,
    // Six empty squares with no name: which code, from where?
    Dont: () => <PinInput length={6} />,
  },
};
