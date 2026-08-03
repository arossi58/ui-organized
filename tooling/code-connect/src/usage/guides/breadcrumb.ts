import type { UsageGuide } from "../types.js";

export const breadcrumbUsage: UsageGuide = {
  slug: "breadcrumb",
  codeName: "Breadcrumb",
  summary:
    "A trail showing where the current page sits in a hierarchy, and offering the way back up it. It answers where am I, not what can I do here.",
  useWhen: [
    "The content is genuinely nested, two or more levels deep.",
    "The reader may arrive from a search or a link with no sense of context.",
    "Moving up a level is a common enough need to deserve a permanent affordance.",
  ],
  avoid: [
    {
      text: "On a flat structure, where a trail of one link says nothing.",
    },
    {
      text: "To record the path someone happened to take, which is what the back button is for.",
    },
    {
      text: "For switching between sibling views of one page.",
      instead: ["tabs"],
    },
    {
      text: "As the main way around a product.",
      instead: ["navigation"],
    },
  ],
  guidance: [
    {
      do: "Show the hierarchy, from the root to the page currently open.",
      dont: "Show a history of visited pages, which changes meaning with every route in.",
      example: "hierarchy",
    },
    {
      do: "Leave the last item as plain text, since it is the page being read.",
      dont: "Make the current page a link back to itself.",
      example: "current-page",
    },
    {
      do: "Use the same names the destinations use for themselves.",
      dont: "Shorten labels until they stop matching the pages they lead to.",
    },
  ],
  accessibility: [
    "The trail is a navigation landmark and the last item is marked as current, so keep exactly one per page.",
    "Separators are decoration: the meaning has to survive with them ignored.",
    "Truncate the middle rather than the ends when space is short, since root and current carry the most.",
  ],
  content: [
    "Use each destination's own title, in the same case and wording.",
    "Keep the root recognisable, whether that is Home or the area's own name.",
  ],
  related: [
    { slug: "navigation", when: "the reader is choosing where to go rather than backing out." },
    { slug: "pagination", when: "the movement is through a sequence rather than a hierarchy." },
  ],
};
