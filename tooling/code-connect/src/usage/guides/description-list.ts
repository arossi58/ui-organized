import type { UsageGuide } from "../types.js";

export const descriptionListUsage: UsageGuide = {
  slug: "description-list",
  codeName: "DescriptionList",
  summary:
    "Terms and their details, such as a record's fields on a detail page or the summary of a plan. Every term lines up in one column, so a reader scans the left edge to find a field.",
  useWhen: [
    "A single record's fields are read rather than edited: an order, a profile, a plan.",
    "A summary sits beside a form or at the end of a flow, before the reader confirms.",
    "Each value needs a label, and a table of one row would waste the width.",
  ],
  avoid: [
    {
      text: "For many records compared side by side, which is what a table is for.",
      instead: ["data-table"],
    },
    {
      text: "For values the reader edits in place, which need form fields.",
    },
  ],
  guidance: [
    {
      do: "Keep terms short and in the reader's words, so the column stays narrow and scannable.",
      dont: "Write each term as a sentence, so the term column takes half the width.",
      example: "terms",
    },
    {
      do: "Use the stacked layout in a narrow column, where details would wrap beside their terms.",
      dont: "Squeeze the inline layout into a sidebar, where every value wraps into a tall strip.",
      example: "layouts",
    },
  ],
  accessibility: [
    "It is a real description list, so a screen reader announces each term with its details.",
    "Put a status's meaning in words as well as colour, as a Tag with a label does.",
  ],
  content: [
    "Show an empty value as a dash or as Not set, never as a blank cell.",
    "Format dates and amounts the way the rest of the page does.",
  ],
  related: [
    { slug: "data-table", when: "several records are compared in rows." },
    { slug: "card", when: "the list is one panel among several." },
  ],
};
