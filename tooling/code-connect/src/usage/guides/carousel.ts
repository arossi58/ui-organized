import type { UsageGuide } from "../types.js";

export const carouselUsage: UsageGuide = {
  slug: "carousel",
  codeName: "Carousel",
  summary:
    "A row of slides shown a page at a time, with controls for moving between them. It trades visibility for space, so anything after the first slide is seen by far fewer readers.",
  useWhen: [
    "The items are browsed casually, and seeing all of them at once is not needed.",
    "Space is short and the items are alike in kind, such as a set of images.",
    "Letting the reader sample a few items matters more than showing every one.",
  ],
  avoid: [
    {
      text: "For content the reader must see, since later slides are routinely skipped.",
    },
    {
      text: "For switching between distinct views of one subject.",
      instead: ["tabs"],
    },
    {
      text: "For content that should drift past on its own with no controls.",
      instead: ["marquee"],
    },
    {
      text: "For a long set the reader needs to scan or compare.",
      instead: ["scroll-area"],
    },
  ],
  guidance: [
    {
      do: "Keep the previous and next buttons wherever readers move through slides on purpose.",
      dont: "Remove both the buttons and the dots, leaving a swipe the reader has to guess at.",
      example: "controls",
    },
    {
      do: "Give every slide the same kind of content at the same size.",
      dont: "Mix unrelated content in one carousel, so each move is a surprise.",
      example: "same-kind",
    },
    {
      do: "Keep the set small enough that the dots can be counted at a glance.",
      dont: "Load a dozen slides, turning the indicators into a strip nobody counts.",
      example: "slide-count",
    },
    {
      do: "Leave `autoplay` off unless the reader can stop it.",
      dont: "Advance slides on a timer, moving content away while someone is still reading it.",
    },
  ],
  accessibility: [
    "Previous, next and every dot are labelled buttons, so the carousel works from a keyboard without extra wiring.",
    "Pass a `label`, so the region is announced by name rather than as an anonymous group.",
    "Content on slides that are off screen still needs real text alternatives for its images.",
    "Autoplay moves content without warning, so avoid it or give the reader a way to pause.",
  ],
  content: [
    "Keep any text on a slide short enough to read at a glance.",
  ],
  related: [
    { slug: "marquee", when: "the content should move continuously and needs no controls." },
    { slug: "tabs", when: "each panel is a different view the reader chooses by name." },
  ],
};
