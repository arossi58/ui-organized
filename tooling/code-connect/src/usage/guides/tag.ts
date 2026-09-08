import type { UsageGuide } from "../types.js";

export const tagUsage: UsageGuide = {
  slug: "tag",
  codeName: "Tag",
  summary:
    "A small label that states what something is or what condition it is in: a status, a type, a category. It describes the thing beside it rather than doing anything.",
  useWhen: [
    "A record carries a state worth reading at a glance, such as active, pending or failed.",
    "Items belong to categories that repeat across a list.",
    "An applied filter or selection needs to stay visible while it is in force.",
  ],
  avoid: [
    {
      text: "As a control. Anything that runs an action should look like one.",
      instead: ["button"],
    },
    {
      text: "For a measurement or a proportion, which a reading against a scale conveys better.",
      instead: ["meter"],
    },
    {
      text: "For a message that needs a sentence to explain it.",
      instead: ["alert"],
    },
    {
      text: "On every row of a list, where a state shared by everything says nothing at all.",
    },
  ],
  guidance: [
    {
      do: "Keep the label to one or two words, so a column of tags stays scannable.",
      dont: "Put a sentence in a tag, which then reads as a paragraph wearing a border.",
      example: "short-labels",
    },
    {
      do: "Map each `variant` to one meaning and hold it across the whole product.",
      dont: "Pick colours per screen, so the same state is green in one list and grey in the next.",
      example: "consistent-variants",
    },
    {
      do: "Keep one emphasis level within a list, so the tags rank equally.",
      dont: "Mix emphasised and subdued tags in one column, implying a hierarchy that isn't there.",
      example: "one-emphasis",
    },
  ],
  accessibility: [
    "A tag is read as plain text, so the word has to carry the meaning the colour repeats.",
    "Emphasised tags are the palette's tightest pairing: check contrast before restyling them.",
    "Nothing announces a tag as a status, so where the state is critical put it in the row's own text too.",
  ],
  content: [
    "Name the state, not the event: Failed, not A failure occurred.",
    "Keep one word per state across the product, so Active never becomes Enabled elsewhere.",
  ],
  related: [
    { slug: "alert", when: "the state needs explaining rather than naming." },
    { slug: "button", when: "the label is something you can act on." },
    { slug: "avatar", when: "the label identifies a person or entity." },
  ],
};
