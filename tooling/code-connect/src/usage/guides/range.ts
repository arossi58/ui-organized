import type { UsageGuide } from "../types.js";

export const rangeUsage: UsageGuide = {
  slug: "range",
  codeName: "Range",
  summary:
    "A slider for setting a value by position. It suits a value that is felt rather than known, where seeing where you are in the range is most of the point.",
  useWhen: [
    "The reader is adjusting toward a result rather than entering a known figure.",
    "The position within the range carries meaning on its own.",
    "The effect of a change can be seen immediately as the value moves.",
  ],
  avoid: [
    {
      text: "When the exact number matters and typing it is faster.",
      instead: ["number-field"],
    },
    {
      text: "For displaying a value the reader can't change.",
      instead: ["meter", "progress"],
    },
    {
      text: "For a handful of named stops, where the labels say more than a track does.",
      instead: ["segmented-control", "radio-group"],
    },
  ],
  guidance: [
    {
      do: "Show the current value, and label the ends so the scale is readable at rest.",
      dont: "Offer a bare track, where the value is whatever the handle's position implies.",
      example: "labelled-ends",
    },
    {
      do: "Set `step`, or `snapValues` for uneven stops, so every reachable value is a legal one.",
      dont: "Leave a continuous track that lands on numbers the system will only round anyway.",
      example: "steps",
    },
    {
      do: "Apply the result live where you can, so the slider explains itself as it moves.",
      dont: "Defer the effect to a save, leaving the reader dragging with no feedback.",
    },
  ],
  accessibility: [
    "The handle is keyboard operable and reports its value and bounds, so never rebuild the track as a bare div.",
    "A pointer target this small needs a generous hit area, and a keyboard path that doesn't depend on precision.",
    "Format the value for people rather than machines, since the formatted text is what gets announced.",
  ],
  content: [
    "Label the property, not the widget: Volume, not Volume slider.",
    "Use end labels that name the extremes in the reader's terms, such as Low and High.",
  ],
  related: [
    { slug: "number-field", when: "the exact value is known and typing is quicker." },
    { slug: "meter", when: "the value is being reported rather than set." },
  ],
};
