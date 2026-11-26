import type { UsageGuide } from "../types.js";

export const navigationMenuUsage: UsageGuide = {
  slug: "navigation-menu",
  codeName: "NavigationMenu",
  summary:
    "A site's top navigation: a row of triggers that each open a panel of links, with plain links between them. It suits a site whose main sections each hold a few pages to choose between.",
  useWhen: [
    "A site's main sections each hold a few pages a visitor chooses between.",
    "Every page needs the same few destinations along the top, in one row.",
  ],
  avoid: [
    {
      text: "For an app with many sections, which a sidebar keeps in view.",
      instead: ["navigation"],
    },
    {
      text: "For commands that act on the page rather than pages to go to.",
      instead: ["menubar", "menu"],
    },
  ],
  guidance: [
    {
      do: "Keep the bar to a handful of destinations, so it fits in one row with room to spare.",
      dont: "Put every page in the bar, so it runs past the edge of a narrow window.",
      example: "length",
    },
    {
      do: "Give each link in a panel a line of description that says where it leads.",
      dont: "Name links with words that only make sense once the page is open.",
      example: "describe",
    },
    {
      do: "Make a page with nothing under it a link in the bar, such as Pricing.",
      dont: "Hide a single page behind a trigger whose panel holds one link.",
    },
  ],
  accessibility: [
    "It is a navigation landmark. Name it with aria-label, such as Main, when the page has more than one.",
    "Each trigger is a button that reports aria-expanded. Hover opens its panel only for a mouse, after a short delay, so a passing pointer opens nothing.",
    "Left and Right move along the bar, ArrowDown enters an open panel, and Escape closes it and returns focus to the trigger.",
    "Mark the current page with current, which sets aria-current on its link.",
  ],
  content: [
    "Label triggers with the kind of page they lead to, such as Product or Resources.",
    "Keep each link to a word or two, with at most one line under it.",
  ],
  related: [
    { slug: "navigation", when: "an app has many sections, navigated from the side." },
    { slug: "menubar", when: "the items are commands rather than pages." },
    { slug: "breadcrumb", when: "showing where a page sits among the pages above it." },
  ],
};
