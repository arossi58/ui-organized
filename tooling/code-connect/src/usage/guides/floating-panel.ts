import type { UsageGuide } from "../types.js";

export const floatingPanelUsage: UsageGuide = {
  slug: "floating-panel",
  codeName: "FloatingPanel",
  summary:
    "A small window that floats above the page and can be dragged and resized while the reader keeps working behind it. It holds tools or details someone wants within reach, not a decision they must make.",
  useWhen: [
    "The reader needs a tool or reference open alongside the main surface, not instead of it.",
    "Where the panel sits depends on what it would otherwise cover, so the reader should place it.",
    "The panel stays open across many actions on the page beneath it.",
  ],
  avoid: [
    {
      text: "For a task that must be finished or cancelled before anything else happens.",
      instead: ["dialog", "alert-dialog"],
    },
    {
      text: "For supporting content that belongs attached to one edge of the screen.",
      instead: ["sheet"],
    },
    {
      text: "For a few details tied to one trigger, which should close when focus moves on.",
      instead: ["popover"],
    },
  ],
  guidance: [
    {
      do: "Give every panel a title, so the header says what it holds and where to grab it.",
      dont: "Leave the header empty, so the panel is unnamed and its drag handle looks like blank space.",
      example: "titled",
    },
    {
      do: "Include a close button in the header, next to the title.",
      dont: "Ship a panel whose only way out is the control that opened it.",
      example: "closable",
    },
    {
      do: "Open it somewhere it covers as little of the work as possible.",
      dont: "Drop it over the content the reader was about to use it with.",
    },
  ],
  accessibility: [
    "The title names the panel for assistive technology, so it must describe the contents.",
    "The page behind stays interactive, so focus is not trapped and the reader can move back and forth.",
    "Dragging and resizing are pointer gestures, so the panel's default size and position must already be usable.",
  ],
  content: [
    "Title the panel with a noun for what it holds: Layers, not Open layers.",
  ],
  related: [
    { slug: "dialog", when: "the page behind should wait until the reader is done." },
    { slug: "sheet", when: "the panel should stay pinned to an edge." },
    { slug: "popover", when: "the content belongs to one trigger and dismisses easily." },
  ],
};
