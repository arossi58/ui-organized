import type { UsageGuide } from "../types.js";

export const switchUsage: UsageGuide = {
  slug: "switch",
  codeName: "Switch",
  summary:
    "An on or off setting that takes effect the moment it is flipped. There is no save step, so its label names a state the reader is turning on rather than a request.",
  useWhen: [
    "The setting applies immediately, with nothing left to submit.",
    "The two states really are on and off, with no third possibility.",
    "The reader can see or reasonably trust that the change took effect.",
  ],
  avoid: [
    {
      text: "Inside a form whose values only apply once it is submitted.",
      instead: ["checkbox"],
    },
    {
      text: "For a mode with a visible effect on the surface, like a view or a formatting mark.",
      instead: ["toggle"],
    },
    {
      text: "For choosing between two named alternatives, where neither one is off.",
      instead: ["segmented-control"],
    },
  ],
  guidance: [
    {
      do: "Label the thing being switched, so the label reads the same in both states.",
      dont: "Write the label as the action, so it describes the opposite once flipped.",
      example: "state-label",
    },
    {
      do: "Keep one convention per list, so a column of settings behaves one way.",
      dont: "Mix switches and checkboxes in a single list, implying two different behaviours.",
      example: "consistent-list",
    },
    {
      do: "Apply the change immediately and report a failure next to the switch.",
      dont: "Flip optimistically and let a silent failure leave the control and the truth out of step.",
    },
  ],
  accessibility: [
    "The control announces its on or off state alongside the label, so the label must not change with it.",
    "An immediate setting needs a visible result: when nothing on screen changes, say what happened.",
    "Keep the label beside the switch rather than in a distant heading, since the two are read together.",
  ],
  content: [
    "Name the setting, not the act: Two-factor authentication, not Enable two-factor authentication.",
    "Avoid labels that already contain On or Off, which then contradict the control.",
  ],
  related: [
    { slug: "checkbox", when: "the value is submitted with a form." },
    { slug: "toggle", when: "the control is a pressed mode rather than a setting." },
  ],
};
