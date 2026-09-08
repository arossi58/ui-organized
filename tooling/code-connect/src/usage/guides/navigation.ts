import type { UsageGuide } from "../types.js";

export const navigationUsage: UsageGuide = {
  slug: "navigation",
  codeName: "NavItem",
  summary:
    "The standing list of places in a product, usually a sidebar. Its job is to say what exists and where the reader currently is, and to keep saying it.",
  useWhen: [
    "A product has several areas the reader moves between regularly.",
    "Knowing what exists is part of understanding the product.",
    "The set of destinations is stable rather than changing per screen.",
  ],
  avoid: [
    {
      text: "For actions, which change something rather than going somewhere.",
      instead: ["menu", "toolbar"],
    },
    {
      text: "For switching between views of one page.",
      instead: ["tabs", "segmented-control"],
    },
    {
      text: "For showing where the current page sits in a hierarchy.",
      instead: ["breadcrumb"],
    },
  ],
  guidance: [
    {
      do: "Mark the current destination as selected, and keep its parent group open.",
      dont: "Leave the rail unmarked, so the reader has to infer where they are from the page.",
      example: "selected",
    },
    {
      do: "Name destinations after what they contain, in the reader's words.",
      dont: "Name them after internal systems or teams, which mean nothing from outside.",
      example: "plain-names",
    },
    {
      do: "Keep the collapsed rail's icons paired with names on hover and in the expanded state.",
      dont: "Collapse to glyphs alone and expect them to be learned.",
    },
  ],
  accessibility: [
    "The rail is a navigation landmark, so keep one per surface and let its items be real links.",
    "Selection is announced as current, which means marking it visually alone isn't enough.",
    "In collapsed mode each item still needs an accessible name, since the label is no longer on screen.",
  ],
  content: [
    "Use one or two plain words per destination, in the same grammar throughout.",
    "Group items only when the groups mean something to the reader, not to the org chart.",
  ],
  related: [
    { slug: "breadcrumb", when: "the question is where the current page sits." },
    { slug: "tabs", when: "the reader is switching views rather than areas." },
    { slug: "menubar", when: "the bar holds commands rather than destinations." },
  ],
};
