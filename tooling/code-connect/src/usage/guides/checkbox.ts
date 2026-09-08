import type { UsageGuide } from "../types.js";

export const checkboxUsage: UsageGuide = {
  slug: "checkbox",
  codeName: "Checkbox",
  summary:
    "A labelled box for an independent yes or no. Each one stands on its own, so several together are several answers rather than one choice between them.",
  useWhen: [
    "The answer is a plain yes or no confirmed as part of a form.",
    "Several options can apply at once, each independent of the rest.",
    "A parent row covers children that are only partly selected, shown with `indeterminate`.",
  ],
  avoid: [
    {
      text: "For picking one option from a set, where a column of boxes invites picking two.",
      instead: ["radio-group"],
    },
    {
      text: "For a setting that takes effect the instant it changes.",
      instead: ["switch"],
    },
    {
      text: "For a mode whose effect is visible on the surface, like a view or a formatting mark.",
      instead: ["toggle"],
    },
  ],
  guidance: [
    {
      do: "Write the label as the statement being agreed to, phrased positively.",
      dont: "Phrase the label as a negative, so clearing the box becomes a double negative.",
      example: "positive-label",
    },
    {
      do: "Set `indeterminate` on a parent whose children are only partly selected.",
      dont: "Show the parent as checked when some of its children aren't.",
      example: "indeterminate",
    },
    {
      do: "Keep a related set together under one heading, in one column.",
      dont: "Scatter members of a set through a form, where the set can't be read as one.",
    },
  ],
  accessibility: [
    "The `label` is both the accessible name and the click target, so it needs to say what checking means.",
    "Indeterminate is a display state, not a third value: what gets submitted is still checked or not.",
    "Say that a box is required in words, since the required styling alone isn't a universal convention.",
  ],
  content: [
    "Write what checking means, not an instruction to check: Send weekly summaries, not Check to subscribe.",
    "Keep a set of labels parallel in grammar, so the group reads as one question.",
  ],
  related: [
    { slug: "switch", when: "the setting applies the moment it changes." },
    { slug: "radio-group", when: "exactly one of the options may be chosen." },
    { slug: "toggle", when: "the control is a mode you can see the effect of." },
  ],
};
