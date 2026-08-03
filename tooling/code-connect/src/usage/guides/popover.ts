import type { UsageGuide } from "../types.js";

export const popoverUsage: UsageGuide = {
  slug: "popover",
  codeName: "Popover",
  summary:
    "A small floating surface anchored to the control that opened it. It holds content the reader can interact with, close to the thing it belongs to.",
  useWhen: [
    "A control needs a little more space for options, detail or a short form.",
    "The connection to the trigger is part of the meaning.",
    "The content is small enough that taking over the screen would be excessive.",
  ],
  avoid: [
    {
      text: "For a list of commands, which has its own component and keyboard behaviour.",
      instead: ["menu"],
    },
    {
      text: "For a plain label naming a control.",
      instead: ["tooltip"],
    },
    {
      text: "For read-only detail shown on hover.",
      instead: ["hover-card"],
    },
    {
      text: "For a task big enough to need its own focused surface.",
      instead: ["dialog", "sheet"],
    },
  ],
  guidance: [
    {
      do: "Name the surface with a `PopoverTitle`, or an `aria-label` when it has no heading.",
      dont: "Open an unnamed floating box, which announces nothing when focus lands in it.",
      example: "named",
    },
    {
      do: "Keep it to one job, and let the reader close it without deciding anything.",
      dont: "Fill it with a form long enough to scroll, which a panel would hold better.",
      example: "scoped",
    },
    {
      do: "Open on click, so the surface only appears when it was asked for.",
      dont: "Open on hover, where the content moves under a pointer on its way somewhere else.",
    },
  ],
  accessibility: [
    "The content is a dialog, so it needs a name: a title, or `aria-label` when there is no heading.",
    "Focus moves into it and Escape closes it, so nothing inside should be the only route to anything.",
    "It stays anchored to its trigger, so keep placement sensible rather than clever on small screens.",
  ],
  content: [
    "Title the surface with what it contains, in two or three words.",
    "Keep the body to one idea: a popover that needs a scrollbar is the wrong component.",
  ],
  related: [
    { slug: "menu", when: "the content is a list of actions." },
    { slug: "tooltip", when: "a few words of label would do." },
    { slug: "dialog", when: "the task deserves the whole surface's attention." },
  ],
};
