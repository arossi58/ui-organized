import type { UsageGuide } from "../types.js";

export const appShellUsage: UsageGuide = {
  slug: "app-shell",
  codeName: "AppShell",
  summary:
    "An application's frame: a header across the top, a sidebar down the side, and the page beside them. On a narrow screen the sidebar moves into a sheet that the header's menu button opens.",
  useWhen: [
    "An app has several sections, each a page, that a reader moves between all day.",
    "Every page needs the same header and sidebar, with the page changing beside them.",
  ],
  avoid: [
    {
      text: "For a site whose sections a visitor chooses from along the top.",
      instead: ["navigation-menu"],
    },
    {
      text: "For one page with a few sections, which a heading per section serves.",
      instead: ["page-header"],
    },
  ],
  guidance: [
    {
      do: "Give every page the same shell, so the sidebar and header stay put and only the page changes.",
      dont: "Swap the sidebar for a different one on some pages, so readers lose their place.",
    },
    {
      do: "Mark the current page in the sidebar, so a reader arriving from a link knows where they are.",
      dont: "Leave every item looking the same, so the page has to say where the reader is.",
      example: "current",
    },
    {
      do: "Keep the header to a mark, a few links and one or two controls.",
      dont: "Crowd the header with every action, which leaves nothing for a narrow screen to drop.",
      example: "header",
    },
  ],
  accessibility: [
    "A skip link comes first in the tab order and moves focus past the header to the page.",
    "There is one banner, one main area and one sidebar navigation, which is in the rail or the sheet, never both.",
    "The sheet is a dialog: focus moves into it, Escape closes it, and focus returns to the menu button.",
    "A click in the sheet that goes to a page closes it, so the page the reader chose is in view.",
  ],
  content: [
    "Name the menu button for what it opens, such as Open navigation.",
    "Keep sidebar labels to a word or two, the same as the page titles they lead to.",
  ],
  related: [
    { slug: "navigation", when: "the sidebar's own items, sub-pages and rail." },
    { slug: "navigation-menu", when: "the links across the header." },
    { slug: "sheet", when: "a panel from the edge for anything other than navigation." },
  ],
};
