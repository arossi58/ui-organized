import type { UsageGuide } from "../types.js";

export const sheetUsage: UsageGuide = {
  slug: "sheet",
  codeName: "Sheet",
  summary:
    "A panel anchored to an edge of the screen. It holds more than a dialog comfortably can, and keeps the surface it came from visible beside it.",
  useWhen: [
    "The content is long or list-shaped and benefits from a tall panel.",
    "The reader should keep sight of what the panel relates to.",
    "The same content works as a side panel on a laptop and a bottom panel on a phone.",
  ],
  avoid: [
    {
      text: "For a short, self-contained task, where a centred dialog focuses attention better.",
      instead: ["dialog"],
    },
    {
      text: "For a single decision with two answers.",
      instead: ["alert-dialog"],
    },
    {
      text: "For content that is central rather than supporting, which belongs on the page.",
    },
    {
      text: "For a small detail attached to one control.",
      instead: ["popover"],
    },
  ],
  guidance: [
    {
      do: "Pick the `side` from the content: an edge nearest what the panel relates to.",
      dont: "Slide panels in from different edges around one product for no reason.",
      example: "side",
    },
    {
      do: "Title the sheet and keep its primary action in the footer, in view.",
      dont: "Bury the action at the bottom of a long scroll, out of sight when it is needed.",
      example: "anchored-action",
    },
    {
      do: "Let the sheet scroll its own content while its frame stays put.",
      dont: "Stack a sheet over a dialog, where two layers compete for the same escape key.",
    },
  ],
  accessibility: [
    "It traps focus like a dialog, so it needs a title and a clear way back out.",
    "The panel scrolls independently, so make sure the keyboard reaches its footer as well as its body.",
    "On a phone the panel is close to full width, so the trigger's context must survive being covered.",
  ],
  content: [
    "Title with the content, not the container: Filters, not Filter panel.",
    "Keep the footer to one primary action and one way out.",
  ],
  related: [
    { slug: "dialog", when: "the task is short and deserves the centre of the screen." },
    { slug: "popover", when: "the content is small and belongs beside its trigger." },
  ],
};
