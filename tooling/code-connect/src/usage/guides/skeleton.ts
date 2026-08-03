import type { UsageGuide } from "../types.js";

export const skeletonUsage: UsageGuide = {
  slug: "skeleton",
  codeName: "Skeleton",
  summary:
    "A placeholder shaped like the content about to arrive. It holds the layout still and shows the page is working, without pretending to be data.",
  useWhen: [
    "Content is loading into a layout whose shape you already know.",
    "The wait is short, but long enough that an empty area would look broken.",
    "Several regions load independently and each should show its own state.",
  ],
  avoid: [
    {
      text: "For an operation the reader started and is actively waiting on.",
      instead: ["progress"],
    },
    {
      text: "For a wait long enough to need explaining, where a sentence serves better.",
      instead: ["alert"],
    },
    {
      text: "For content that failed to load, since a placeholder implies it is still coming.",
    },
    {
      text: "As decoration on a surface that isn't loading anything.",
    },
  ],
  guidance: [
    {
      do: "Match the placeholder to the real content's shape and size.",
      dont: "Fill the area with generic blocks that shift everything once the content lands.",
      example: "matched-shape",
    },
    {
      do: "Use `lines` for text, so a paragraph reads as a paragraph while it loads.",
      dont: "Stand in for a block of copy with one tall rectangle.",
      example: "text-lines",
    },
    {
      do: "Keep the skeleton brief, and say what is happening once a wait gets long.",
      dont: "Leave a page shimmering indefinitely, where slow and broken look the same.",
    },
  ],
  accessibility: [
    "A skeleton conveys nothing to a screen reader: mark the region as busy, or announce the load another way.",
    "The shimmer stops under a reduced-motion preference, and `animated={false}` turns it off outright.",
    "Never leave focus on a control that a skeleton is standing in for, since it isn't there yet.",
  ],
  related: [
    { slug: "progress", when: "the reader started the work and wants to watch it." },
    { slug: "alert", when: "the wait needs explaining rather than filling." },
  ],
};
