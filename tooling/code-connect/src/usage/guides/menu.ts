import type { UsageGuide } from "../types.js";

export const menuUsage: UsageGuide = {
  slug: "menu",
  codeName: "Menu",
  summary:
    "A list of actions behind one trigger. It keeps commands out of the way until they are wanted, which is what makes it the home for everything a surface can do but rarely does.",
  useWhen: [
    "A surface has more actions than deserve permanent space.",
    "The actions relate to one object or one area.",
    "Some of them are rare, and hiding them costs the reader little.",
  ],
  avoid: [
    {
      text: "For the one action a surface is really about, which should be visible.",
      instead: ["button"],
    },
    {
      text: "For choosing a value that a form will submit.",
      instead: ["select"],
    },
    {
      text: "For moving between pages or sections.",
      instead: ["navigation", "tabs"],
    },
    {
      text: "For content or controls that aren't a list of commands.",
      instead: ["popover"],
    },
  ],
  guidance: [
    {
      do: "Group related items and separate the groups, so a long menu can be scanned.",
      dont: "List a dozen items in one run, where finding anything means reading everything.",
      example: "grouped",
    },
    {
      do: "Put a destructive item last and mark it as destructive.",
      dont: "Sit Delete between two ordinary items, a slip away from either of them.",
      example: "destructive-last",
    },
    {
      do: "Start each item with a verb, so every line reads as something that happens.",
      dont: "Mix commands, states and headings in the same list without distinction.",
    },
  ],
  accessibility: [
    "The menu is keyboard operable: arrows move, Enter selects, Escape closes and focus returns to the trigger.",
    "Checkbox and radio items report their state, so use them rather than styling a plain item as selected.",
    "Keep item labels short and distinct, since they are read one at a time rather than scanned.",
  ],
  content: [
    "Write items as verbs: Duplicate, Rename, Export.",
    "Keep group labels to a noun that says what the group covers.",
  ],
  related: [
    { slug: "context-menu", when: "the actions belong to a right-click on an object." },
    { slug: "menubar", when: "a surface needs several persistent command menus." },
    { slug: "select", when: "the list is values rather than actions." },
  ],
};
