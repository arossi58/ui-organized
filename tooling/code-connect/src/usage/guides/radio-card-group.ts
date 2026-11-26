import type { UsageGuide } from "../types.js";

export const radioCardGroupUsage: UsageGuide = {
  slug: "radio-card-group",
  codeName: "RadioCardGroup",
  summary:
    "One choice from a few options that each need room to explain themselves, such as a plan or a delivery speed. Each option is a card with a title and a line of detail, and the whole card is the target.",
  useWhen: [
    "Exactly one option is chosen, and each needs a sentence or an icon to be understood.",
    "There are two to six options, few enough to read side by side.",
    "The choice is a deliberate step, such as picking a plan or a setup path.",
  ],
  avoid: [
    {
      text: "When each option is a word or two, where cards add bulk and no meaning.",
      instead: ["radio-group"],
    },
    {
      text: "When more than one option can apply at the same time.",
      instead: ["checkbox-card-group"],
    },
    {
      text: "For a long list, which a grid of cards turns into a wall.",
      instead: ["select", "combobox"],
    },
  ],
  guidance: [
    {
      do: "Keep each description to one line that says what changes if this option is chosen.",
      dont: "Repeat the title in the description, or bury the deciding detail in a second sentence.",
      example: "descriptions",
    },
    {
      do: "Use `columns` only when every card's text fits without stacking into a tower.",
      dont: "Squeeze long descriptions into narrow columns, where each card wraps line after line.",
      example: "columns",
    },
    {
      do: "Preselect a default only where one is genuinely safe for everyone.",
      dont: "Preselect the costly option, which a distracted reader will accept without noticing.",
    },
  ],
  accessibility: [
    "The title alone names each option and the description is read after it, so the title has to stand on its own.",
    "The group takes one tab stop and the arrow keys move between cards, as in any radio group.",
    "Icons are decorative, so never let one carry meaning the title does not.",
  ],
  content: [
    "Phrase the group label as the question and each title as an answer, in one grammatical form.",
    "Put a consequence of an option in its description, not in a note below the group.",
  ],
  related: [
    { slug: "radio-group", when: "the options are short enough to list." },
    { slug: "checkbox-card-group", when: "more than one option can be chosen." },
    { slug: "segmented-control", when: "the choice switches a view rather than setting a value." },
  ],
};
