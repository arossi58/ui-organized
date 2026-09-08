import type { UsageGuide } from "../types.js";

export const paginationUsage: UsageGuide = {
  slug: "pagination",
  codeName: "Pagination",
  summary:
    "Numbered movement through a list too long to show at once. Pages give the reader a position they can return to, which endless scrolling cannot.",
  useWhen: [
    "The list is long enough that loading it whole would be slow or unreadable.",
    "Readers benefit from a stable position they can bookmark or come back to.",
    "Knowing roughly how much there is helps the reader decide what to do.",
  ],
  avoid: [
    {
      text: "For a short list that fits on one screen.",
    },
    {
      text: "For a feed with no meaningful end, where a page number means little.",
    },
    {
      text: "For steps in a process, which have an order and a destination.",
      instead: ["breadcrumb"],
    },
  ],
  guidance: [
    {
      do: "Show where the reader is and how much there is, so a jump is an informed one.",
      dont: "Offer only previous and next, leaving the extent of the list a mystery.",
      example: "position",
    },
    {
      do: "Keep the control in the same place on every page, so it can be found without looking.",
      dont: "Move it, resize it, or drop it when a page happens to be short.",
      example: "stable-placement",
    },
    {
      do: "Keep the page in the URL, so a result can be shared and returned to.",
      dont: "Hold the page in memory alone, so a refresh sends the reader back to the start.",
    },
  ],
  accessibility: [
    "Each page control is a real link or button, and the current page is marked as current.",
    "Previous and next need names of their own, since an arrow alone announces nothing.",
    "Announce that the list changed after a page turn, because visually it simply replaces itself.",
  ],
  content: [
    "Label previous and next in words, even when an icon carries them visually.",
    "Say what is being counted when it isn't obvious from the list itself.",
  ],
  related: [
    { slug: "breadcrumb", when: "the reader is moving up a hierarchy rather than along a list." },
    { slug: "scroll-area", when: "the content should stay in one continuous scrolling region." },
  ],
};
