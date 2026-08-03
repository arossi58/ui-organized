import type { UsageGuide } from "../types.js";

export const accordionUsage: UsageGuide = {
  slug: "accordion",
  codeName: "Accordion",
  summary:
    "A stack of sections that open and close in place. It suits content most readers skim and few read in full, where every heading stays visible and the detail waits.",
  useWhen: [
    "Several sections share one page and each is optional reading.",
    "The headings alone tell the reader which section they want.",
    "Collapsing keeps a long page navigable rather than hiding what matters.",
  ],
  avoid: [
    {
      text: "For content most readers need, which should simply be on the page.",
    },
    {
      text: "For one section on its own, which needs no set to belong to.",
      instead: ["collapsible"],
    },
    {
      text: "For alternative views of the same thing, where only one applies at a time.",
      instead: ["tabs"],
    },
    {
      text: "To make a long form look short, since the fields are still all required.",
    },
  ],
  guidance: [
    {
      do: "Write headings that say what is inside, so a closed panel can still be judged.",
      dont: "Label panels More, Details or Other, which can only be evaluated by opening them.",
      example: "descriptive-headings",
    },
    {
      do: "Open the section people came for, and let the rest stay closed.",
      dont: "Start with everything collapsed when one panel is what nearly everyone wants.",
      example: "sensible-default",
    },
    {
      do: "Allow several panels open at once when readers compare across sections.",
      dont: "Close one panel to open another when the two are meant to be read together.",
    },
  ],
  accessibility: [
    "Each heading is a button reporting whether its panel is open, so state is never carried by an icon alone.",
    "Content in a closed panel is out of reach of find-in-page, so nothing critical should be the only copy there.",
    "Keep headings short: they are read one after another before anything is expanded.",
  ],
  content: [
    "Phrase headings as the question or the noun the reader has in mind.",
    "Keep each panel to one topic, so opening it answers exactly one thing.",
  ],
  related: [
    { slug: "collapsible", when: "there is only one section to open." },
    { slug: "tabs", when: "the sections are alternatives rather than a list." },
  ],
};
