import type { UsageGuide } from "../types.js";

export const segmentedControlUsage: UsageGuide = {
  slug: "segmented-control",
  codeName: "SegmentedControl",
  summary:
    "A short row of mutually exclusive options sharing one track. The choice changes what the surface shows straight away, and every alternative stays in view.",
  useWhen: [
    "There are two to five options, each with a one or two word label.",
    "The choice changes a view or a filter rather than setting a value to submit.",
    "Keeping every alternative visible is worth the horizontal space.",
  ],
  avoid: [
    {
      text: "For more options than fit on one line without shrinking the labels.",
      instead: ["select"],
    },
    {
      text: "For moving between sections of content with their own panels.",
      instead: ["tabs"],
    },
    {
      text: "For a value inside a form that is saved on submit.",
      instead: ["radio-group"],
    },
    {
      text: "For independent modes that can be active at the same time.",
      instead: ["toggle"],
    },
  ],
  guidance: [
    {
      do: "Keep labels to one or two words so every segment fits without truncating.",
      dont: "Put phrases in segments, which squeezes the track and hides where each one ends.",
      example: "short-labels",
    },
    {
      do: "Keep the options parallel: one dimension, one grammar, one kind of thing.",
      dont: "Slip an action into the track, where one segment does something instead of selecting.",
      example: "parallel",
    },
    {
      do: "Hold the segment order fixed, so the position of an option can be learned.",
      dont: "Reorder by recency or popularity, moving the target under the reader.",
    },
  ],
  accessibility: [
    "Give the control an `aria-label` when no visible heading beside it names the choice.",
    "It reads as one control rather than a row of buttons, so keep the set short enough to move through.",
    "Selection is shown by a moving pill, so make sure the selected label still contrasts against it.",
  ],
  content: [
    "Use nouns for views and adjectives for filters, but not both in one track.",
    "Keep labels the same length where you can, so the track doesn't shift as it is read.",
  ],
  related: [
    { slug: "tabs", when: "each option owns a panel of content." },
    { slug: "radio-group", when: "the choice is a form value with longer labels." },
    { slug: "select", when: "the list is too long to show at once." },
  ],
};
