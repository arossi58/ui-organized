import type { UsageGuide } from "../types.js";

export const scrollAreaUsage: UsageGuide = {
  slug: "scroll-area",
  codeName: "ScrollArea",
  summary:
    "A bounded region that scrolls its own content with a themed scrollbar. It keeps a long list inside a fixed layout instead of letting it push the page around.",
  useWhen: [
    "A region has a height the layout depends on, and content that can exceed it.",
    "The surrounding chrome should stay put while the content moves.",
    "A native scrollbar would look out of place against the surface it sits on.",
  ],
  avoid: [
    {
      text: "For the page itself, which should scroll the way the browser scrolls.",
    },
    {
      text: "For a list long enough that scrolling stops being a way to find anything.",
      instead: ["pagination"],
    },
    {
      text: "Around content that already fits, where the region does nothing.",
    },
    {
      text: "Nested inside another scrolling region, which makes both harder to use.",
    },
  ],
  guidance: [
    {
      do: "Give the region a bounded height, since without one it never scrolls.",
      dont: "Wrap content in a scroll area and leave the height to the content.",
      example: "bounded",
    },
    {
      do: "Let the boundary be visible, so it is clear where the scrolling region ends.",
      dont: "Cut content off at an invisible edge, where more content looks like no content.",
      example: "visible-edge",
    },
    {
      do: "Set `orientation` to the axis the content actually overflows on.",
      dont: "Allow both axes by default, where a small overflow becomes a two-directional drag.",
    },
  ],
  accessibility: [
    "A scrolling region needs to be reachable and scrollable by keyboard, not by pointer alone.",
    "Content inside stays in the tab order, so focus can move somewhere currently out of view.",
    "Keep the scrollbar visible enough to find, since a hidden one hides the fact that there is more.",
  ],
  related: [
    { slug: "pagination", when: "the list is too long for scrolling to be a way of finding things." },
    { slug: "sheet", when: "the long content deserves a panel of its own." },
  ],
};
