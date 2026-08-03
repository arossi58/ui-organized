import type { UsageGuide } from "../types.js";

export const dialogUsage: UsageGuide = {
  slug: "dialog",
  codeName: "Dialog",
  summary:
    "A modal surface that takes over until it is dealt with. It stops everything else, so it has to be carrying something worth stopping for.",
  useWhen: [
    "A short task needs finishing without losing the surface behind it.",
    "The work needs its own space but not its own page.",
    "Everything else should wait until the reader is done or has backed out.",
  ],
  avoid: [
    {
      text: "For a confirmation with two answers, which has a narrower component.",
      instead: ["alert-dialog"],
    },
    {
      text: "For a small piece of extra detail anchored to a control.",
      instead: ["popover"],
    },
    {
      text: "For a long or multi-step task, which deserves a page of its own.",
    },
    {
      text: "For a message that needs no decision at all.",
      instead: ["alert", "toast"],
    },
  ],
  guidance: [
    {
      do: "Give every dialog a `DialogTitle` that says what it is for.",
      dont: "Open an untitled panel and leave the heading work to the body copy.",
      example: "titled",
    },
    {
      do: "Put the confirming action last in the footer, with the way out beside it.",
      dont: "Offer three or four competing actions, so leaving is as hard as deciding.",
      example: "footer",
    },
    {
      do: "Keep the content short enough to take in without scrolling on a laptop.",
      dont: "Nest a second dialog on top of the first, burying the way back.",
    },
  ],
  accessibility: [
    "Focus moves into the dialog and is trapped there, so the content must contain a way out.",
    "Escape and the backdrop both close it, which is why nothing unsaved should be lost by closing.",
    "The title names the dialog for assistive technology, so it isn't optional decoration.",
  ],
  content: [
    "Title with the task, not the tool: Rename project, not Project settings dialog.",
    "Label the confirming action with what it does, so it reads without the title above it.",
  ],
  related: [
    { slug: "alert-dialog", when: "the dialog is one decision with two answers." },
    { slug: "sheet", when: "the panel belongs to an edge and can be wider or taller." },
    { slug: "popover", when: "the content is small and anchored to its trigger." },
  ],
};
