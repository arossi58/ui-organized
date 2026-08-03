import type { UsageGuide } from "../types.js";

export const inputUsage: UsageGuide = {
  slug: "input",
  codeName: "Input",
  summary:
    "A single line of text the reader types themselves. It is the default field: reach for a more specific one only when the value has a shape the plain field can't help with.",
  useWhen: [
    "The value is short free text with no fixed set of answers.",
    "The reader knows what to type without being shown options.",
    "The field belongs to a form and is submitted with the rest of it.",
  ],
  avoid: [
    {
      text: "For a value that must come from a known list.",
      instead: ["select", "combobox"],
    },
    {
      text: "For text long enough to need more than one line.",
      instead: ["text-area"],
    },
    {
      text: "For a number with bounds or steps, which deserves its own affordances.",
      instead: ["number-field"],
    },
    {
      text: "For a query that filters content as it is typed.",
      instead: ["search-input"],
    },
  ],
  guidance: [
    {
      do: "Always give the field a visible `label`, above the field and outside it.",
      dont: "Use the placeholder as the label, which disappears the moment anyone types.",
      example: "labelled",
    },
    {
      do: "Put the format in `helperText` before the reader types, not after they fail.",
      dont: "Accept anything, then reject it with a message that only says the value is invalid.",
      example: "helper-first",
    },
    {
      do: "Size the field to the value: a short field promises a short answer.",
      dont: "Stretch every field to the full width, so nothing hints at what is expected.",
      example: "sized-to-content",
    },
  ],
  accessibility: [
    "The `label` is the accessible name, so a field without one is unusable by anyone who can't see its context.",
    "`error` is announced with the field, which is why the message belongs there rather than in a separate list.",
    "Mark required fields in words as well as styling, since colour and an asterisk carry no meaning alone.",
  ],
  content: [
    "Label with a noun for the value, not an instruction: Full name, not Enter your name.",
    "Keep helper text to one line, and put the rule in it rather than in a tooltip.",
  ],
  related: [
    { slug: "text-area", when: "the answer runs to sentences." },
    { slug: "combobox", when: "the value comes from a list but the list is long." },
    { slug: "field-error", when: "a message needs to sit under a control of your own." },
  ],
};
