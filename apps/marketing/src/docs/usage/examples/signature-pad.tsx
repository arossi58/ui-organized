import { SignaturePad } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const signaturePadExamples: UsageExampleSet = {
  guide: {
    layout: "padded",
    Do: () => <SignaturePad label="Sign to approve" size="sm" />,
    // A blank box: no hint of where the signature goes or how big it should be.
    Dont: () => <SignaturePad label="Sign to approve" size="sm" showGuide={false} />,
  },

  "stated-purpose": {
    layout: "padded",
    Do: () => (
      <SignaturePad
        label="Sign to approve this report"
        helperText="Your signature confirms you have reviewed every section."
        size="sm"
      />
    ),
    // Signature for what? The reader is asked to commit without being told.
    Dont: () => <SignaturePad label="Signature" size="sm" />,
  },
};
