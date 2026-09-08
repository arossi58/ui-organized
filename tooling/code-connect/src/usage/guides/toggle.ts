import type { UsageGuide } from "../types.js";

export const toggleUsage: UsageGuide = {
  slug: "toggle",
  codeName: "Toggle",
  summary:
    "A button that stays pressed. It carries a mode you can see the effect of straight away, like a formatting mark or a view, rather than a value that is saved later.",
  useWhen: [
    "The thing it controls is visible on the same surface, so the result confirms the press.",
    "The change applies the moment it is pressed, with nothing to submit afterwards.",
    "Several related modes belong together, grouped inside a `ToggleGroup`.",
  ],
  avoid: [
    {
      text: "For a setting in a form that only takes effect once the form is submitted.",
      instead: ["checkbox"],
    },
    {
      text: "For an on or off setting whose effect isn't visible, where a labelled control reads more clearly.",
      instead: ["switch"],
    },
    {
      text: "For picking one option from a labelled set of alternatives.",
      instead: ["segmented-control", "radio-group"],
    },
    {
      text: "For an action that runs once and doesn't stay pressed.",
      instead: ["button"],
    },
  ],
  guidance: [
    {
      do: "Keep the label the same in both states, so only the pressed styling changes.",
      dont: "Swap the label between Show and Hide, leaving nobody sure whether it reports the state or the action.",
      example: "stable-label",
    },
    {
      do: "Put mutually exclusive modes in a `ToggleGroup`, where exactly one stays pressed.",
      dont: "Leave the modes as loose toggles that can all be on, or all off, at once.",
      example: "grouped",
    },
    {
      do: "Reach for a toggle only where the surface shows what changed.",
      dont: "Use one for a preference saved later, where nothing on screen confirms the press.",
    },
  ],
  accessibility: [
    "Renders a button carrying its pressed state, so assistive technology announces the state with the label.",
    "An icon-only toggle needs an `aria-label` naming what it controls, not what the glyph looks like.",
    "A `ToggleGroup` reads as one control, so keep the group short and its labels parallel.",
  ],
  content: [
    "Name the thing being toggled, not its current state: Bold, not Bold on.",
    "Keep grouped labels the same part of speech, so the set reads as one choice.",
  ],
  related: [
    { slug: "switch", when: "the setting is a plain on or off with no visible surface effect." },
    { slug: "segmented-control", when: "the options are labelled alternatives rather than modes." },
    { slug: "button", when: "the control runs an action instead of holding a state." },
  ],
};
