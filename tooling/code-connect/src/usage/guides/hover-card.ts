import type { UsageGuide } from "../types.js";

export const hoverCardUsage: UsageGuide = {
  slug: "hover-card",
  codeName: "HoverCard",
  summary:
    "A preview that appears when a reference is hovered or focused. It saves a trip to another page by showing enough of the thing to decide whether to go.",
  useWhen: [
    "A link or name refers to something with a useful summary.",
    "The preview saves navigation rather than adding a step.",
    "Everything in it is also reachable by following the reference itself.",
  ],
  avoid: [
    {
      text: "For a few words naming a control.",
      instead: ["tooltip"],
    },
    {
      text: "For content the reader has to act on, since it appears and vanishes with the pointer.",
      instead: ["popover"],
    },
    {
      text: "For information available nowhere else.",
    },
    {
      text: "On a surface where most items have one, so moving the pointer sets off a cascade.",
    },
  ],
  guidance: [
    {
      do: "Show a summary that answers whether to follow the reference.",
      dont: "Reproduce the whole record, so the preview becomes a page that hovers.",
      example: "summary",
    },
    {
      do: "Attach it to references worth previewing, sparingly.",
      dont: "Attach one to every link in a paragraph, where reading sets off cards constantly.",
      example: "sparing",
    },
    {
      do: "Keep the open and close delays long enough to survive a pointer passing through.",
      dont: "Open instantly on hover, so the card flickers as the reader moves across the page.",
    },
  ],
  accessibility: [
    "Hover is not available on touch, so the preview must never hold something you can only get there.",
    "It opens on focus too, which means its content should be short enough to be worth the interruption.",
    "Keep the trigger a real link or button, so the underlying destination stays reachable.",
  ],
  content: [
    "Lead with what identifies the thing, then one line of context.",
    "Keep it to a few lines: anything longer belongs on the page it previews.",
  ],
  related: [
    { slug: "tooltip", when: "a short label is all that is needed." },
    { slug: "popover", when: "the reader needs to interact with what is shown." },
  ],
};
