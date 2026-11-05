import { TagsInput } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const tagsInputExamples: UsageExampleSet = {
  "entry-hint": {
    layout: "padded",
    Do: () => (
      <TagsInput
        label="Topics"
        placeholder="Add a topic"
        helperText="Press Enter or type a comma after each topic."
        defaultValue={["Design", "Research"]}
      />
    ),
    // Nothing says that typing and pressing Enter makes a chip.
    Dont: () => <TagsInput label="Topics" defaultValue={["Design", "Research"]} />,
  },

  "stated-limit": {
    layout: "padded",
    Do: () => (
      <TagsInput
        label="Topics"
        placeholder="Add a topic"
        helperText="Up to three topics."
        max={3}
        defaultValue={["Design", "Research"]}
      />
    ),
    // The third topic is the last one allowed, and nothing warns the reader.
    Dont: () => (
      <TagsInput label="Topics" placeholder="Add a topic" max={3} defaultValue={["Design", "Research"]} />
    ),
  },
};
