import type { UsageGuide } from "../types.js";

export const dateRangeInputUsage: UsageGuide = {
  slug: "date-range-input",
  codeName: "DateRangeInput",
  summary:
    "Two dates that belong together as one value. The ends constrain each other, so an end before its start is not something the reader has to be told about.",
  useWhen: [
    "The value is a period: from one date to another.",
    "The two ends are only meaningful together.",
    "Seeing both ends on one calendar helps the reader judge the span.",
  ],
  avoid: [
    {
      text: "For a single date with no span.",
      instead: ["date-input"],
    },
    {
      text: "For two dates that are genuinely independent of each other.",
      instead: ["date-input"],
    },
    {
      text: "For a handful of fixed periods, where naming them is faster than picking them.",
      instead: ["select", "segmented-control"],
    },
  ],
  guidance: [
    {
      do: "Keep both ends under one `label` and one message, since they are one value.",
      dont: "Split them into two separate fields with two labels and two error messages.",
      example: "one-value",
    },
    {
      do: "Bound the whole range with `min` and `max`, and let the ends constrain each other.",
      dont: "Allow any pair and explain afterwards that the end can't come first.",
      example: "bounded",
    },
    {
      do: "Offer the common spans nearby when there are obvious ones.",
      dont: "Make every reader assemble last month by hand, twice.",
    },
  ],
  accessibility: [
    "Each end is a native date control with its own name, so both are typeable and both take focus.",
    "One shared message covers the pair, which is what keeps the problem attached to the value that has it.",
    "Say the range's limits in helper text as well as enforcing them, since a disabled day announces nothing.",
  ],
  content: [
    "Label the period, not the mechanics: Reporting period, not Start and end date.",
    "Keep the two end labels short and parallel, since they are read as a pair.",
  ],
  related: [
    { slug: "date-input", when: "only one date is being collected." },
    { slug: "date-time-input", when: "the period is fine-grained enough to need times." },
  ],
};
