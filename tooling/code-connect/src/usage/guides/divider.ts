import type { UsageGuide } from "../types.js";

export const dividerUsage: UsageGuide = {
  slug: "divider",
  codeName: "Divider",
  summary:
    "A thin rule between things that would otherwise run together. It is the quietest way to say that a boundary exists, and it earns its place only where spacing alone isn't enough.",
  useWhen: [
    "Two groups sit close together and the gap between them is doing too little.",
    "A list needs its rows separated without giving each one a surface.",
    "A row of controls contains groups that should read as distinct.",
  ],
  avoid: [
    {
      text: "Between every element, where the lines become the loudest thing on the page.",
    },
    {
      text: "Where more space would say the same thing more quietly.",
    },
    {
      text: "As a decorative flourish under a heading, which the type hierarchy already handles.",
    },
    {
      text: "To group content that really wants a surface of its own.",
      instead: ["card"],
    },
  ],
  guidance: [
    {
      do: "Let `spacing` set the room around the rule, so the boundary sits evenly.",
      dont: "Crowd a rule against the content on one side and float it on the other.",
      example: "spacing",
    },
    {
      do: "Use the vertical orientation inside a row, to separate groups of controls.",
      dont: "Divide every control from the next, which turns the grouping into noise.",
      example: "grouping",
    },
    {
      do: "Keep one rule weight across a surface.",
      dont: "Mix rules, borders and shadows as separators in the same view.",
    },
  ],
  accessibility: [
    "The rule is decorative, so it must never be the only thing conveying a grouping.",
    "Anything a divider implies should also be said by headings, spacing or labels.",
  ],
  related: [
    { slug: "card", when: "the group deserves a surface rather than a line." },
    { slug: "toolbar", when: "the rule is separating groups of controls in a strip." },
  ],
};
