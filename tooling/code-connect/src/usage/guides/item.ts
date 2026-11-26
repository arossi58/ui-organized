import type { UsageGuide } from "../types.js";

export const itemUsage: UsageGuide = {
  slug: "item",
  codeName: "Item",
  summary:
    "A row with an optional icon or avatar, a title with a line of description, and actions at the end. With a link the whole row follows it, and ItemGroup lists rows together.",
  useWhen: [
    "A settings page lists options, each with a title, a line of explanation and a switch.",
    "A list of people, files or places each opens its own page when the row is pressed.",
    "A few rows need the same layout but are too few, or too different, for a table.",
  ],
  avoid: [
    {
      text: "For records compared side by side across the same columns, which is what a table is for.",
      instead: ["data-table"],
    },
    {
      text: "For a field and its value in a record, which a description list lays out in one column.",
      instead: ["description-list"],
    },
    {
      text: "For choosing one option from several, which needs radio cards or a radio group.",
      instead: ["radio-card-group", "radio-group"],
    },
  ],
  guidance: [
    {
      do: "Give a row `href` so the whole row follows the link, and keep its controls in `actions`.",
      dont: "Put a button inside the title or wrap the row in a link, which nests controls inside a link.",
      example: "links",
    },
    {
      do: "Keep the title to a few words and the description to one line.",
      dont: "Write a paragraph under the title, so every row is a different height and hard to scan.",
      example: "length",
    },
    {
      do: "Use one ItemGroup for rows that belong together, so they read as one list.",
      dont: "Stack loose rows with gaps of their own, which reads as unrelated items.",
      example: "group",
    },
  ],
  accessibility: [
    "An ItemGroup is a list, so a screen reader announces how many rows it holds.",
    "A link row is one link named by its title. Its actions stay separate tab stops after it.",
    "Name a control in `actions` by the row: give a switch the row's title as its label.",
    "A row's text cannot be selected with the pointer when the row is a link.",
  ],
  content: [
    "Start the title with the word a reader scans for, such as the setting's name.",
    "Write the description as a fragment that ends with a period.",
    "Use at most two controls in `actions`; move the rest to a menu.",
  ],
  related: [
    { slug: "data-table", when: "rows share columns the reader compares." },
    { slug: "card", when: "the content needs more than a title and a line." },
    { slug: "switch", when: "a row turns one setting on or off." },
  ],
};
