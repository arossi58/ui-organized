import type { UsageGuide } from "../types.js";

export const tabsUsage: UsageGuide = {
  slug: "tabs",
  codeName: "Tabs",
  summary:
    "Alternative views of one subject, one at a time, in a space they share. The reader is switching what they look at rather than moving somewhere new.",
  useWhen: [
    "Several panels are views of the same thing.",
    "Only one panel is needed at a time, and switching is cheap.",
    "The labels are short enough that the whole set fits on one line.",
  ],
  avoid: [
    {
      text: "For sections that should be read in order or compared side by side.",
      instead: ["accordion"],
    },
    {
      text: "For moving between areas of a product, which is navigation.",
      instead: ["navigation", "breadcrumb"],
    },
    {
      text: "For a filter over one list, where a segmented track says it more plainly.",
      instead: ["segmented-control"],
    },
    {
      text: "For steps in a process that has an order and an end.",
    },
  ],
  guidance: [
    {
      do: "Label tabs with nouns that name their content, in a stable order.",
      dont: "Use verbs or questions, which make a tab read as an action rather than a view.",
      example: "noun-labels",
    },
    {
      do: "Keep the set small enough to fit without wrapping or scrolling.",
      dont: "Line up eight tabs, where the last ones are effectively hidden.",
      example: "small-set",
    },
    {
      do: "Preserve each panel's state, so returning to a tab shows what was left there.",
      dont: "Reset a panel every time it is revisited, punishing the reader for comparing.",
    },
  ],
  accessibility: [
    "The strip is one tab stop with arrow keys moving between tabs, so keep the set short and ordered.",
    "Each tab is tied to its panel, which is why the label has to describe the content rather than the click.",
    "A disabled tab still announces itself, so remove one that will never apply rather than disabling it.",
  ],
  content: [
    "Use one or two words per tab, in one grammatical form.",
    "Order tabs by expected use, and keep that order the same everywhere the pattern appears.",
  ],
  related: [
    { slug: "segmented-control", when: "the choice filters a single view." },
    { slug: "accordion", when: "the sections should be readable together." },
    { slug: "navigation", when: "the reader is moving between areas." },
  ],
};
