import type { UsageGuide } from "../types.js";

export const searchInputUsage: UsageGuide = {
  slug: "search-input",
  codeName: "SearchInput",
  summary:
    "A text field marked as search: a leading icon that says what it does, and a clear control that appears once there is something to clear.",
  useWhen: [
    "The reader is looking through content rather than filling in a value.",
    "Results or a filtered list respond to what is typed.",
    "The query is disposable, and clearing it should take one action.",
  ],
  avoid: [
    {
      text: "For choosing one value from a fixed list, where the result is a selection.",
      instead: ["combobox"],
    },
    {
      text: "For an ordinary form field that happens to be short.",
      instead: ["input"],
    },
    {
      text: "As decoration on a page where nothing actually searches.",
    },
  ],
  guidance: [
    {
      do: "Say what is being searched, in the label or the placeholder.",
      dont: "Ship a bare field labelled Search, leaving its scope to be discovered by trying it.",
      example: "scope",
    },
    {
      do: "Report how the query landed, including when it matched nothing.",
      dont: "Empty the results silently, where no matches looks the same as broken.",
      example: "feedback",
    },
    {
      do: "Keep the clear control available whenever there is a query to clear.",
      dont: "Make returning to the unfiltered view a matter of deleting characters one at a time.",
    },
  ],
  accessibility: [
    "The clear control is a real button, so it needs to stay reachable by keyboard as well as by pointer.",
    "Results that change as you type need announcing, since the field itself says nothing about them.",
    "Keep the label visible: a magnifier icon is a convention, not a name.",
  ],
  content: [
    "Name what is being searched: Search records by name, rather than a bare Search.",
    "Say what a query matches when it isn't obvious, so an empty result reads as a fact.",
  ],
  related: [
    { slug: "combobox", when: "the reader is picking a value rather than searching." },
    { slug: "input", when: "the field collects a value the form will keep." },
  ],
};
