import type { UsageGuide } from "../types.js";

export const ratingGroupUsage: UsageGuide = {
  slug: "rating-group",
  codeName: "RatingGroup",
  summary:
    "A row of stars for giving or showing a score on a short, familiar scale. It asks for a quick judgement, where the overall feeling matters more than the exact meaning of each step.",
  useWhen: [
    "The reader gives a quick, subjective score, and speed matters more than precision.",
    "The scale is short and widely understood, usually five steps.",
    "An existing score is shown read-only beside the thing it rates.",
  ],
  avoid: [
    {
      text: "For a precise number or a wide range, where stars cannot show the difference between steps.",
      instead: ["range", "number-field"],
    },
    {
      text: "For a measurement against a target, such as usage or completion.",
      instead: ["meter", "progress"],
    },
    {
      text: "For choosing between named options that are not steps on one scale.",
      instead: ["radio-group", "segmented-control"],
    },
  ],
  guidance: [
    {
      do: "Say what the ends of the scale mean, in the label or the helper text.",
      dont: "Label it Rating and leave the reader guessing whether one star is the best or the worst.",
      example: "scale-meaning",
    },
    {
      do: "Keep the default five stars, so the scale reads the same everywhere it appears.",
      dont: "Stretch the row to ten stars, which nobody can count at a glance or hit reliably.",
      example: "five-stars",
    },
    {
      do: "Set `readOnly` when showing a score someone already gave.",
      dont: "Show a past score with a live control, so a curious click quietly changes it.",
    },
  ],
  accessibility: [
    "Each star is announced as a numbered option in a group, so the `label` has to say what is being rated.",
    "Arrow keys change the score a step at a time, so keyboard readers never need to reach an individual star.",
    "Filled and empty stars differ only in color, so keep that color pairing at full contrast when theming.",
  ],
  content: [
    "Name what is being rated: How useful was this answer, not Rating.",
    "Spell out the scale in helper text: 1 is not useful, 5 is very useful.",
  ],
  related: [
    { slug: "range", when: "the value is a precise point on a wide scale." },
    { slug: "radio-group", when: "each step has a name that needs reading." },
  ],
};
