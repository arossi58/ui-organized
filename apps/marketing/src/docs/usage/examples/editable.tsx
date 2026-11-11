import { Editable } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const editableExamples: UsageExampleSet = {
  "visible-controls": {
    layout: "padded",
    Do: () => <Editable label="Project name" defaultValue="Quarterly review" showControls />,
    // Reads as static text: nothing says it can change until a pointer hovers it.
    Dont: () => <Editable label="Project name" defaultValue="Quarterly review" />,
  },

  "empty-placeholder": {
    layout: "padded",
    Do: () => <Editable label="Project name" placeholder="Add a project name" />,
    // An empty value with no placeholder is a label over nothing at all.
    Dont: () => <Editable label="Project name" />,
  },
};
