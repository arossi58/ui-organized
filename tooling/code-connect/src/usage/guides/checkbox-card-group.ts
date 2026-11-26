import type { UsageGuide } from "../types.js";

export const checkboxCardGroupUsage: UsageGuide = {
  slug: "checkbox-card-group",
  codeName: "CheckboxCardGroup",
  summary:
    "Any number of choices from a few options that each need room to explain themselves, such as add-ons or interests. Each option is a card with a title and a line of detail, and the whole card toggles.",
  useWhen: [
    "Several options can apply at once, and each needs a sentence or an icon to be understood.",
    "There are two to eight options, few enough to read side by side.",
    "The choices are worth a moment's thought, such as add-ons or permissions.",
  ],
  avoid: [
    {
      text: "When exactly one option can be chosen.",
      instead: ["radio-card-group"],
    },
    {
      text: "When each option is a word or two, where a plain list of check boxes is quicker to scan.",
      instead: ["checkbox"],
    },
    {
      text: "For values the reader types or picks from a long list.",
      instead: ["tags-input", "combobox"],
    },
  ],
  guidance: [
    {
      do: "Keep each description to one line that says what the option adds.",
      dont: "Repeat the title in the description, or bury the deciding detail in a second sentence.",
      example: "descriptions",
    },
    {
      do: "Say in the label or an error how many are needed when the group has a minimum.",
      dont: "Reject the form without saying that at least one card had to be chosen.",
      example: "minimum",
    },
    {
      do: "Leave cards unchecked by default unless the option is free and expected.",
      dont: "Check a paid add-on in advance and leave the reader to notice it.",
    },
  ],
  accessibility: [
    "Each card is a check box named by its title, with the description read after it.",
    "Every card is its own tab stop and Space toggles it, as with any check box.",
    "Icons are decorative, so never let one carry meaning the title does not.",
  ],
  content: [
    "Phrase the group label as the question and each title as a short noun phrase.",
    "Name the cost or the effect in the description, where it is read before the choice.",
  ],
  related: [
    { slug: "checkbox", when: "the options are short enough to list." },
    { slug: "radio-card-group", when: "only one option can be chosen." },
    { slug: "tags-input", when: "the values are typed rather than picked." },
  ],
};
