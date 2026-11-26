import type { UsageGuide } from "../types.js";

export const emptyStateUsage: UsageGuide = {
  slug: "empty-state",
  codeName: "EmptyState",
  summary:
    "What to show where content would be but isn't: a short title, a sentence on why, and the action that fills the space. It keeps an empty list, search or page from reading as broken.",
  useWhen: [
    "A list, table or page has nothing in it yet, and the reader can do something about it.",
    "A search or filter returns no results and should say how to widen it.",
    "A section is empty on purpose, such as a cleared queue, and should read as done rather than missing.",
  ],
  avoid: [
    {
      text: "For content that is still loading, where an empty message would flash up before the data.",
      instead: ["skeleton", "spinner"],
    },
    {
      text: "For a failure, which needs to say what went wrong and how to try again.",
      instead: ["alert"],
    },
    {
      text: "As decoration in space that will never hold content.",
    },
  ],
  guidance: [
    {
      do: "Name what is missing and offer the one action that fills it.",
      dont: "Say only that there is nothing here, and leave the reader to work out what to do next.",
      example: "action",
    },
    {
      do: "Say when the reader's own search or filter caused it, and offer to clear it.",
      dont: "Show the first-run message when a filter has hidden every row.",
      example: "filtered",
    },
    {
      do: "Match the size to the space: `sm` in a table or card, `lg` for a whole page.",
      dont: "Put a page-sized empty state in a small panel, where it pushes everything else out of view.",
    },
  ],
  accessibility: [
    "The title is a paragraph by default; pass `headingLevel` when it starts a section of the page outline.",
    "The icon is decorative, so the title has to carry the meaning on its own.",
    "When results empty out after a search, announce the change, for example through a live region on the result count.",
  ],
  content: [
    "Title the empty state with what is missing, not with an apology.",
    "Keep the description to one sentence, and name the action in the button rather than describing it.",
  ],
  related: [
    { slug: "data-table", when: "the empty state sits in a table, where TableEmpty renders it at the small size." },
    { slug: "featured-icon", when: "you want the icon on its own, beside a heading of your own." },
  ],
};
