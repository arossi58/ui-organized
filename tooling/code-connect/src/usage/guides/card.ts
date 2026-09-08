import type { UsageGuide } from "../types.js";

export const cardUsage: UsageGuide = {
  slug: "card",
  codeName: "Card",
  summary:
    "A surface that gathers related content into one object. The border is a claim that everything inside belongs together, so it is worth making only when that is true.",
  useWhen: [
    "A set of content reads as one thing, such as a record in a list.",
    "Several such things sit side by side and need separating from each other.",
    "The grouping needs a surface of its own rather than just a heading.",
  ],
  avoid: [
    {
      text: "Around a whole page, where the frame separates the content from nothing.",
    },
    {
      text: "Nested inside another card, where the second border stops meaning anything.",
    },
    {
      text: "To separate two blocks of text, which a rule or spacing does more quietly.",
      instead: ["divider"],
    },
    {
      text: "As a floating surface anchored to a control.",
      instead: ["popover"],
    },
  ],
  guidance: [
    {
      do: "Give each card one subject, with its actions in the footer.",
      dont: "Collect unrelated blocks in one card because they happen to sit near each other.",
      example: "one-subject",
    },
    {
      do: "Keep padding and structure consistent across a set of cards.",
      dont: "Vary padding and emphasis card by card, so a grid reads as an accident.",
      example: "consistent",
    },
    {
      do: "Reserve the elevated variant for something genuinely raised above the rest.",
      dont: "Elevate every card, which flattens the distinction back to nothing.",
    },
  ],
  accessibility: [
    "A card is a container, not a control: if the whole thing is clickable, put a real link or button inside it.",
    "Give each card a heading in its header, so the set can be navigated by headings.",
    "Keep the reading order inside the card the same as its visual order.",
  ],
  content: [
    "Lead with what identifies the card's subject, then its supporting detail.",
    "Keep each card's actions to the one or two that belong to its subject.",
  ],
  related: [
    { slug: "divider", when: "the separation is a line rather than a surface." },
    { slug: "popover", when: "the surface belongs to a control." },
  ],
};
