import type { UsageGuide } from "../types.js";

export const dataTableUsage: UsageGuide = {
  slug: "data-table",
  codeName: "DataTable",
  summary:
    "A grid of records with columns the reader can sort, filter, select and act on. It is for working through many rows of structured data, and turns into a stack of cards on narrow screens.",
  useWhen: [
    "The reader compares many records across the same set of fields.",
    "Finding a record means sorting, filtering or searching rather than scrolling.",
    "Actions apply to one row, or to a selection of rows at once.",
  ],
  avoid: [
    {
      text: "For a few items with one or two fields each, where separate cards read faster.",
      instead: ["card"],
    },
    {
      text: "For items whose nesting matters more than their fields.",
      instead: ["tree-view"],
    },
    {
      text: "For a short list of values the reader picks from.",
      instead: ["listbox"],
    },
    {
      text: "For laying a page out in columns, since a table announces rows and headers the content does not have.",
    },
  ],
  guidance: [
    {
      do: "Right-align numeric columns with `align: \"end\"`, so digits line up by place value.",
      dont: "Leave numbers left-aligned, where values of different lengths cannot be compared at a glance.",
      example: "align-numbers",
    },
    {
      do: "Show the few columns a reader needs to decide, and move the rest into row detail.",
      dont: "Show every field the record has, pushing the important ones off the right edge.",
      example: "few-columns",
    },
    {
      do: "Write an `empty` title and description that say why nothing is shown and what to do.",
      dont: "Keep the default empty state, which cannot tell no data apart from a filter that matched nothing.",
      example: "empty-state",
    },
    {
      do: "Give the table a `label` that names its records, like Team members.",
      dont: "Call it Table or Data, which tells a screen reader nothing about what the rows are.",
    },
  ],
  accessibility: [
    "The `label` becomes the table's caption, and it is the only name a screen reader announces for the grid.",
    "In an interactive table the grid is one tab stop, and arrow keys move between cells inside it.",
    "Sort order is announced from each column header, so headers should be short and distinct.",
    "Selection checkboxes are named from the `primary` column, so without one each reads as a bare row id.",
  ],
  content: [
    "Write column headers as short nouns, and put units in the header rather than in every cell.",
    "Keep empty and error messages specific: say what is missing and what the reader can do.",
  ],
  related: [
    { slug: "listbox", when: "the reader is choosing a value rather than working with records." },
    { slug: "card", when: "each record needs its own layout rather than aligned fields." },
  ],
};
