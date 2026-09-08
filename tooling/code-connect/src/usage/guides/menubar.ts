import type { UsageGuide } from "../types.js";

export const menubarUsage: UsageGuide = {
  slug: "menubar",
  codeName: "Menubar",
  summary:
    "A row of command menus along the top of an application surface. It suits tools deep enough that their commands need categories, and little else.",
  useWhen: [
    "The surface is an application with far more commands than a toolbar can hold.",
    "Commands fall into stable categories a reader can learn.",
    "People will return often enough for the arrangement to become muscle memory.",
  ],
  avoid: [
    {
      text: "On a content page or a form, where a row of empty-looking menus is just chrome.",
      instead: ["toolbar"],
    },
    {
      text: "For navigation between pages or sections.",
      instead: ["navigation", "tabs"],
    },
    {
      text: "For a handful of actions that would fit behind one trigger.",
      instead: ["menu"],
    },
  ],
  guidance: [
    {
      do: "Keep the top-level categories few and stable, and their names conventional.",
      dont: "Invent categories per screen, so the bar has to be re-read every time.",
      example: "stable-categories",
    },
    {
      do: "Put each command in the one category a reader would look in first.",
      dont: "Repeat the same command across several menus to improve the odds of finding it.",
      example: "one-home",
    },
    {
      do: "Keep the most-used commands available elsewhere too, in reach of a single click.",
      dont: "Bury everyday actions two levels deep because the bar exists.",
    },
  ],
  accessibility: [
    "The bar is one tab stop: arrows move between menus and into them, so keep the structure shallow.",
    "Category names are announced before their items, so a vague category makes every item vaguer.",
    "Menus open on the keyboard as well as the pointer, which is why hover-only behaviour has no place here.",
  ],
  content: [
    "Use one-word category names people already know, and keep the order conventional.",
    "Write commands as verbs, matching the wording used anywhere else they appear.",
  ],
  related: [
    { slug: "menu", when: "one trigger is enough for the commands there are." },
    { slug: "toolbar", when: "the frequent controls deserve to be visible." },
    { slug: "navigation", when: "the bar is really moving between areas." },
  ],
};
