import type { UsageGuide } from "../types.js";

export const radioGroupUsage: UsageGuide = {
  slug: "radio-group",
  codeName: "RadioGroup",
  summary:
    "One choice from a small set of options, all visible at once. Seeing the alternatives side by side is part of the decision, which is what separates it from a dropdown.",
  useWhen: [
    "Exactly one option has to be chosen from a handful of alternatives.",
    "The options deserve reading together before deciding.",
    "An option needs more than a word or two to explain itself.",
  ],
  avoid: [
    {
      text: "When more than one option can apply at the same time.",
      instead: ["checkbox"],
    },
    {
      text: "For a long list, where filtering by typing beats scanning a wall of options.",
      instead: ["select", "combobox"],
    },
    {
      text: "For switching between views of the same content.",
      instead: ["tabs", "segmented-control"],
    },
  ],
  guidance: [
    {
      do: "Give the group a `label` that states what is being chosen.",
      dont: "Leave a bare column of options and let the surrounding copy imply the question.",
      example: "group-label",
    },
    {
      do: "Reserve the horizontal orientation for two or three short labels.",
      dont: "Lay long labels across a row, where each option's extent stops being clear.",
      example: "orientation",
    },
    {
      do: "Preselect a default only where one is genuinely safe for everyone.",
      dont: "Preselect the costly option, which a distracted reader will accept without noticing.",
    },
  ],
  accessibility: [
    "The group takes one tab stop and the arrow keys move between options, which is why they belong in one group.",
    "The group label is announced with each option, so keep option labels short and parallel.",
    "A disabled option stays readable but unreachable: don't use `disabled` to hide something that no longer applies.",
  ],
  content: [
    "Phrase the group label as the question and the options as its answers.",
    "Put any consequence of an option in its own text, not in a footnote below the group.",
  ],
  related: [
    { slug: "select", when: "the list is long enough that collapsing it helps." },
    { slug: "segmented-control", when: "the choice switches a view rather than setting a value." },
    { slug: "checkbox", when: "more than one answer can be true." },
  ],
};
