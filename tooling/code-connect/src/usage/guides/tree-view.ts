import type { UsageGuide } from "../types.js";

export const treeViewUsage: UsageGuide = {
  slug: "tree-view",
  codeName: "TreeView",
  summary:
    "A hierarchy of items that open and close in place, so the reader can move through nested levels without leaving the surface. Each row is either a branch holding more rows or a leaf that can be selected.",
  useWhen: [
    "The items nest, and where something sits in the hierarchy matters to the reader.",
    "The reader needs several levels open at once to compare what is inside them.",
    "Selecting an item should keep its place in the hierarchy in view.",
  ],
  avoid: [
    {
      text: "For a flat list with no nesting at all.",
      instead: ["listbox"],
    },
    {
      text: "For sections of content that open and close, rather than items to select.",
      instead: ["accordion"],
    },
    {
      text: "As the main way around a product.",
      instead: ["navigation"],
    },
    {
      text: "For the path back up to where the reader came from.",
      instead: ["breadcrumb"],
    },
  ],
  guidance: [
    {
      do: "Keep the hierarchy shallow, so any leaf is a few opens away.",
      dont: "Nest branches that each hold a single child, so the reader opens level after level to find one item.",
      example: "shallow",
    },
    {
      do: "Name each branch for what it holds, so the reader can pick one without opening it.",
      dont: "Use generic names like Group 1 and Group 2, which force the reader to open every branch.",
      example: "branch-names",
    },
    {
      do: "Keep `showIndentGuides` on when the tree runs deep, so each row's parent stays traceable.",
      dont: "Remove the guides on a deep tree, leaving indentation as the only clue to where a row belongs.",
      example: "indent-guides",
    },
    {
      do: "Open the branches that hold the current selection on first render.",
      dont: "Select a node inside a closed branch, so the selection exists but nothing on screen shows it.",
    },
  ],
  accessibility: [
    "Arrow keys open, close and move between rows, and typing jumps to a match, so labels should lead with their distinguishing word.",
    "Each row announces its level and whether it is open, so indentation is never the only cue.",
    "A disabled node stays visible but cannot be selected, so say nearby why when the reason is not obvious.",
  ],
  content: [
    "Use the names people already call these items, not internal identifiers.",
    "Keep sibling labels in one form, so each level reads as one set.",
  ],
  related: [
    { slug: "listbox", when: "the options have no nesting." },
    { slug: "accordion", when: "each section holds content rather than items to pick." },
  ],
};
