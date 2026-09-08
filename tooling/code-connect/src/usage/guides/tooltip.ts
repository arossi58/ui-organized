import type { UsageGuide } from "../types.js";

export const tooltipUsage: UsageGuide = {
  slug: "tooltip",
  codeName: "Tooltip",
  summary:
    "A few words that appear when a control is hovered or focused. It names or clarifies something already on screen, and it is never the only place the words exist.",
  useWhen: [
    "An icon-only control needs its name spelled out on hover.",
    "A short clarification helps, but not enough to take permanent space.",
    "The hint is optional: missing it costs the reader nothing important.",
  ],
  avoid: [
    {
      text: "For anything the reader must read, since a hover hint reaches neither touch nor a hurried eye.",
      instead: ["alert"],
    },
    {
      text: "For content with a link or a control inside it, which a hover surface can't be relied on to hold.",
      instead: ["popover"],
    },
    {
      text: "For a rich preview of something.",
      instead: ["hover-card"],
    },
    {
      text: "As a substitute for a label on a form field.",
      instead: ["input"],
    },
  ],
  guidance: [
    {
      do: "Keep it to a few words that name or clarify the control.",
      dont: "Write a sentence or two, which a hover surface hides again before it can be read.",
      example: "brief",
    },
    {
      do: "Keep the bubble to text, so nothing inside it ever has to be reached.",
      dont: "Put a link or a button in a tooltip, which vanishes as the pointer travels toward it.",
      example: "text-only",
    },
    {
      do: "Share one `TooltipProvider` so delays feel the same everywhere.",
      dont: "Tune delays per tooltip, so identical controls behave differently across a surface.",
    },
  ],
  accessibility: [
    "It opens on focus as well as hover, so keyboard users get the hint too, provided the trigger is focusable.",
    "Give an icon-only trigger its own accessible name: the tooltip is a hint, never the label.",
    "Touch has no hover: anything essential has to be on the surface itself.",
  ],
  content: [
    "Name the action or the term, without repeating the label word for word.",
    "Skip the full stop: a tooltip is a label, not a sentence.",
  ],
  related: [
    { slug: "hover-card", when: "the preview is richer than a few words." },
    { slug: "popover", when: "the content is interactive." },
  ],
};
