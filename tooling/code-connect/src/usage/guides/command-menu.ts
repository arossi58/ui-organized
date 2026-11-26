import type { UsageGuide } from "../types.js";

export const commandMenuUsage: UsageGuide = {
  slug: "command-menu",
  codeName: "CommandMenu",
  summary:
    "A search box over every command an app offers, opened from anywhere with a shortcut. The reader types a few letters, arrows to the command and presses Enter without leaving the keyboard.",
  useWhen: [
    "An app has more commands than its menus and toolbars can show at once.",
    "Frequent readers want to run things by name rather than by pointing.",
    "Commands are spread across pages, and one place should reach them all.",
  ],
  avoid: [
    {
      text: "For choosing a value in a form.",
      instead: ["combobox", "select"],
    },
    {
      text: "For a handful of actions on one object.",
      instead: ["menu"],
    },
    {
      text: "For searching content such as documents or messages, where the results are not commands.",
      instead: ["search-input"],
    },
  ],
  guidance: [
    {
      do: "Group commands under short headings, and add `keywords` for the words people actually search for.",
      dont: "Put every command in one long list that only its exact label can find.",
      example: "groups",
    },
    {
      do: "Set a `hotkey` such as `mod+k`, and show it on the button that also opens the menu.",
      dont: "Hide the menu behind a shortcut nobody is told about.",
      example: "hotkey",
    },
    {
      do: "Show a command's own shortcut in `shortcut`, so the menu teaches the faster way.",
      dont: "List shortcuts the app does not actually handle.",
    },
  ],
  accessibility: [
    "Focus stays in the search box, and the highlighted command is its active descendant, so a screen reader follows the arrows.",
    "Escape closes the menu and puts focus back where it was.",
    "A hotkey without a modifier, such as a slash, never fires while the reader is typing in a field.",
  ],
  content: [
    "Name commands as actions: Create project, not Project creation.",
    "Write the placeholder as what can be typed: Search commands and pages.",
  ],
  related: [
    { slug: "kbd", when: "a shortcut is shown on its own." },
    { slug: "dialog", when: "the task needs a form rather than a single command." },
    { slug: "combobox", when: "the reader picks a value rather than running a command." },
  ],
};
