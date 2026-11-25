import { Attachment } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const stack = { display: "flex", flexDirection: "column" as const, gap: "var(--spacing-space-02)", width: "100%", maxWidth: 380 };
const noop = () => {};

export const attachmentExamples: UsageExampleSet = {
  errors: {
    layout: "padded",
    Do: () => (
      <div style={stack}>
        <Attachment name="floor-plan.png" status="error" error="The connection dropped. Try again." onRetry={noop} onRemove={noop} />
      </div>
    ),
    // A failure with no reason and nothing to do about it.
    Dont: () => (
      <div style={stack}>
        <Attachment name="floor-plan.png" status="error" onRemove={noop} />
      </div>
    ),
  },

  variants: {
    layout: "padded",
    Do: () => (
      <div style={stack}>
        <p style={{ margin: 0, color: "var(--color-content-primary)", fontSize: "var(--type-size-body-medium)" }}>
          Here is the revised plan.
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-space-02)", flexWrap: "wrap" }}>
          <Attachment variant="chip" name="plan-v2.pdf" size={182000} />
          <Attachment variant="chip" name="notes.txt" size={2048} />
        </div>
      </div>
    ),
    // Rows inside a message crowd out the text they belong to.
    Dont: () => (
      <div style={stack}>
        <p style={{ margin: 0, color: "var(--color-content-primary)", fontSize: "var(--type-size-body-medium)" }}>
          Here is the revised plan.
        </p>
        <Attachment name="plan-v2.pdf" size={182000} />
        <Attachment name="notes.txt" size={2048} />
      </div>
    ),
  },
};
