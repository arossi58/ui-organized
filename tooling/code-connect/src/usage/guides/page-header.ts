import type { UsageGuide } from "../types.js";

export const pageHeaderUsage: UsageGuide = {
  slug: "page-header",
  codeName: "PageHeader",
  summary:
    "The top of a page: where the reader is, what the page is called and what it is for, and the actions that apply to all of it. SectionHeader does the same for a section of the page, and SectionFooter closes one.",
  useWhen: [
    "Every app page needs a title, and most need a line saying what the page is for.",
    "A page has actions that apply to all of it, such as Create or Export.",
    "A long page splits into sections that each need a title and their own actions.",
  ],
  avoid: [
    {
      text: "For the app's own header, with the logo and the main navigation, which belongs above every page.",
    },
    {
      text: "For a title inside a card that needs no description or actions; a heading on its own is enough.",
      instead: ["card"],
    },
  ],
  guidance: [
    {
      do: "Keep one PageHeader per page at heading level one, and step each SectionHeader down from it.",
      dont: "Give every panel its own PageHeader, so the page has several level one headings.",
      example: "levels",
    },
    {
      do: "Put the page's main action last in `actions`, as its one primary button.",
      dont: "Line up several primary buttons, so nothing reads as the main thing to do.",
      example: "actions",
    },
    {
      do: "Use `tabs` for views of the same thing, and let the tabs hold the page body.",
      dont: "Put unrelated pages behind tabs in one header.",
    },
  ],
  accessibility: [
    "The title is a real heading, so the outline starts here; set `headingLevel` when the header is not the top of the page.",
    "The header is not a landmark, so the page keeps the one banner its app header provides.",
    "Breadcrumbs bring their own navigation landmark, labelled Breadcrumb.",
  ],
  content: [
    "Name the page with the noun a reader would look for: Billing, not Manage your billing.",
    "Keep the description to one sentence about what the page is for.",
  ],
  related: [
    { slug: "breadcrumb", when: "the reader needs the path to this page." },
    { slug: "tabs", when: "the page has several views of one thing." },
    { slug: "empty-state", when: "the page has nothing in it yet." },
  ],
};
