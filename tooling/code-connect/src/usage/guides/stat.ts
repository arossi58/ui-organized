import type { UsageGuide } from "../types.js";

export const statUsage: UsageGuide = {
  slug: "stat",
  codeName: "Stat",
  summary:
    "One number and what it means: a label, the value, and how it has moved since a stated point. A row of them gives a dashboard its headline figures before the detail below.",
  useWhen: [
    "A page leads with a few headline figures the reader checks before anything else.",
    "A number matters more for its change than for its size, such as weekly sign-ups.",
    "A summary card needs one figure with its context, such as storage used of a quota.",
  ],
  avoid: [
    {
      text: "For many figures compared across rows, which is what a table is for.",
      instead: ["data-table"],
    },
    {
      text: "For progress toward a goal on its own, which a meter shows at a glance.",
      instead: ["meter", "progress"],
    },
  ],
  guidance: [
    {
      do: "Set `sentiment` for a figure where up is bad news, such as a refund rate or a response time.",
      dont: "Leave the default on a figure where up is bad, so a worsening number shows in green.",
      example: "sentiment",
    },
    {
      do: "Say what the change is measured against, so the reader knows what the delta compares.",
      dont: "Show a bare percentage, which leaves the reader guessing the period it covers.",
      example: "description",
    },
    {
      do: "Use the plain variant for a row of figures inside one card, so they share one frame.",
      dont: "Nest framed stats inside a card, which draws a box inside a box.",
      example: "plain",
    },
  ],
  accessibility: [
    "The arrow is decoration. The direction is also written out, hidden, so a screen reader hears it before the delta.",
    "Write `trendLabel` when Increase or Decrease would mislead, such as for a figure where down is good.",
    "Give a chart in the chart slot its own accessible name, such as a Meter's aria-label.",
  ],
  content: [
    "Format the value for the reader before passing it in: currency, units and separators included.",
    "Keep the label to a few words in the reader's terms, with no trailing colon.",
    "Round the value to the precision the reader acts on.",
  ],
  related: [
    { slug: "card", when: "a figure needs more than a label, a value and a change." },
    { slug: "meter", when: "the figure is a share of a known limit." },
    {
      slug: "description-list",
      when: "a record has several labelled values, none of them a headline.",
    },
  ],
};
