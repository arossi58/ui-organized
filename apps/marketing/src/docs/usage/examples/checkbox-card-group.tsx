import { CheckboxCardGroup } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const box = { width: "100%", maxWidth: 420 };

export const checkboxCardGroupExamples: UsageExampleSet = {
  descriptions: {
    layout: "padded",
    Do: () => (
      <div style={box}>
        <CheckboxCardGroup
          label="Add-ons"
          size="sm"
          defaultValue={["backups"]}
          options={[
            { value: "backups", label: "Backups", description: "Nightly copies, kept for thirty days." },
            { value: "support", label: "Priority support", description: "A reply within one working day." },
          ]}
        />
      </div>
    ),
    // The descriptions restate the titles, and say nothing about what is added.
    Dont: () => (
      <div style={box}>
        <CheckboxCardGroup
          label="Add-ons"
          size="sm"
          defaultValue={["backups"]}
          options={[
            { value: "backups", label: "Backups", description: "Add backups to your plan." },
            { value: "support", label: "Priority support", description: "Add priority support to your plan." },
          ]}
        />
      </div>
    ),
  },

  minimum: {
    layout: "padded",
    Do: () => (
      <div style={box}>
        <CheckboxCardGroup
          label="Topics, choose at least one"
          size="sm"
          error="Choose at least one topic."
          options={[
            { value: "releases", label: "Releases", description: "A note when a new version ships." },
            { value: "events", label: "Events", description: "Talks and workshops near you." },
          ]}
        />
      </div>
    ),
    // Invalid, with nothing to say what the group needed.
    Dont: () => (
      <div style={box}>
        <CheckboxCardGroup
          label="Topics"
          size="sm"
          error
          options={[
            { value: "releases", label: "Releases", description: "A note when a new version ships." },
            { value: "events", label: "Events", description: "Talks and workshops near you." },
          ]}
        />
      </div>
    ),
  },
};
