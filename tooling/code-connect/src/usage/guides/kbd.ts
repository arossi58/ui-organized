import type { UsageGuide } from "../types.js";

export const kbdUsage: UsageGuide = {
  slug: "kbd",
  codeName: "Kbd",
  summary:
    "A key or a shortcut, drawn as the keys on a keyboard. It shows the reader what to press in their own platform's notation: ⌘ on a Mac and Ctrl everywhere else.",
  useWhen: [
    "A shortcut is worth teaching, beside the action it runs.",
    "Documentation or a tooltip names the keys to press.",
    "A command menu or a menu lists each command's shortcut.",
  ],
  avoid: [
    {
      text: "For code or a value the reader types, which is text rather than a key.",
    },
    {
      text: "For a status or a label that names no key.",
      instead: ["tag"],
    },
  ],
  guidance: [
    {
      do: "Write `mod` for the platform's command key, so a Mac shows ⌘ and every other system shows Ctrl.",
      dont: "Write `ctrl` or `meta` for a shortcut that should feel native on every platform.",
      example: "mod",
    },
    {
      do: "Use the `sm` size inside a sentence or a menu row.",
      dont: "Drop a full-size key into running text, where it pushes the lines apart.",
      example: "sizes",
    },
  ],
  accessibility: [
    "A key drawn as a symbol carries its name as hidden text, so a screen reader says Command K.",
    "Showing a shortcut does not make it work; wire the keys up separately, or the hint misleads.",
  ],
  content: [
    "Show the shortcut a reader would really press, not every alternative.",
    "Name keys by their printed label: Esc, Enter, Shift.",
  ],
  related: [
    { slug: "command-menu", when: "the reader runs commands by name and by shortcut." },
    { slug: "tooltip", when: "a shortcut hint sits on a control's hover." },
  ],
};
