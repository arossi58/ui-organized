import type { UsageGuide } from "../types.js";

export const marqueeUsage: UsageGuide = {
  slug: "marquee",
  codeName: "Marquee",
  summary:
    "A row of items that scrolls continuously in a loop. It suggests breadth, like many names or many categories, without asking anyone to read every item in it.",
  useWhen: [
    "The point is that there are many items, not what any single one says.",
    "Each item can be recognised at a glance, such as a short name, mark or tag.",
    "Nothing in the row is something the reader must find, compare or act on.",
  ],
  avoid: [
    {
      text: "For content the reader has to read in full or in order.",
      instead: ["carousel", "scroll-area"],
    },
    {
      text: "For announcements or alerts, which moving text makes easier to miss.",
      instead: ["alert"],
    },
    {
      text: "For items the reader must click, since a moving target is hard to hit.",
    },
  ],
  guidance: [
    {
      do: "Keep `showEdges` on, so items drift in and out of view instead of being sliced.",
      dont: "Turn the fades off on a flat surface, leaving items cut in half at each end.",
      example: "faded-edges",
    },
    {
      do: "Fill the row with short, glanceable items that make sense in any order.",
      dont: "Scroll full sentences past the reader, who then has to chase each one to read it.",
      example: "glanceable-items",
    },
    {
      do: "Set `pauseOnInteraction` so hovering or focusing the row stops the motion.",
      dont: "Run a marquee that nothing can stop, which distracts anyone trying to read around it.",
    },
    {
      do: "Place one marquee on a surface at most, away from the main task.",
      dont: "Stack several moving rows beside a form or other work that needs attention.",
    },
  ],
  accessibility: [
    "Duplicated copies are hidden from assistive technology, so each item is announced once.",
    "The animation stops entirely when the reader prefers reduced motion.",
    "Motion that runs longer than a few seconds needs a way to pause it, so keep `pauseOnInteraction` on or provide a control.",
  ],
  content: [
    "Keep items to a word or two, since each is only in view for a moment.",
  ],
  related: [
    { slug: "carousel", when: "the reader should move through items at their own pace." },
    { slug: "scroll-area", when: "the reader needs to browse a long row themselves." },
  ],
};
